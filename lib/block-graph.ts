// lib/block-graph.ts
// Atomic Block-Graph Data Model Engine for Voltaic.
// Deconstructs ProseMirror / TipTap JSON documents and page trees into an atomic graph of addressable block nodes,
// enabling block-level referencing (((blockId))), bi-directional backlink graph edges, and graph traversal.

export interface AtomicBlockNode {
  id: string;
  type: string; // "paragraph" | "heading" | "taskItem" | "codeBlock" | "tableRow" | "syncedBlock"
  content: string;
  pageId: string;
  parentBlockId: string | null;
  childrenBlockIds: string[];
  properties: Record<string, any>;
  backlinks: string[]; // target block or page IDs linked from this block
  sortOrder: number;
  createdAt?: string;
}

export interface BlockGraphEdge {
  sourceBlockId: string;
  targetId: string; // target pageId or target blockId
  edgeType: "backlink" | "embed" | "synced" | "relation";
}

/**
 * Atomic Block Graph Class
 * Manages atomic block node indexing, graph edge resolution, and traversal.
 */
export class AtomicBlockGraph {
  private blocks: Map<string, AtomicBlockNode> = new Map();
  private edges: BlockGraphEdge[] = [];

  /**
   * Deconstructs a nested ProseMirror/TipTap JSON document into an Atomic Block-Graph.
   */
  public parseDocument(docJson: any, pageId: string): AtomicBlockNode[] {
    if (!docJson || typeof docJson !== "object" || !Array.isArray(docJson.content)) {
      return [];
    }

    const createdNodes: AtomicBlockNode[] = [];

    const processNode = (node: any, parentId: string | null, order: number): string => {
      const blockId = node.attrs?.id || `block_${Math.random().toString(36).substring(2, 11)}`;
      const nodeType = node.type || "paragraph";

      // Extract plain text content
      let textContent = "";
      if (node.text) {
        textContent = node.text;
      } else if (Array.isArray(node.content)) {
        textContent = node.content
          .map((c: any) => c.text || "")
          .join(" ")
          .trim();
      }

      // Extract graph edge references: [[pageId]] or ((blockId))
      const backlinks: string[] = [];
      const linkRegex = /\[\[([^\]]+)\]\]|\(\(([^)]+)\)\)/g;
      let match;
      while ((match = linkRegex.exec(textContent)) !== null) {
        const refId = match[1] || match[2];
        if (refId) {
          backlinks.push(refId);
          this.edges.push({
            sourceBlockId: blockId,
            targetId: refId,
            edgeType: match[1] ? "backlink" : "synced",
          });
        }
      }

      const childrenIds: string[] = [];
      if (Array.isArray(node.content)) {
        node.content.forEach((childNode: any, idx: number) => {
          if (childNode.type && childNode.type !== "text") {
            const childBlockId = processNode(childNode, blockId, idx);
            childrenIds.push(childBlockId);
          }
        });
      }

      const atomicBlock: AtomicBlockNode = {
        id: blockId,
        type: nodeType,
        content: textContent,
        pageId,
        parentBlockId: parentId,
        childrenBlockIds: childrenIds,
        properties: node.attrs || {},
        backlinks,
        sortOrder: order,
        createdAt: new Date().toISOString(),
      };

      this.blocks.set(blockId, atomicBlock);
      createdNodes.push(atomicBlock);
      return blockId;
    };

    docJson.content.forEach((topNode: any, idx: number) => {
      processNode(topNode, null, idx);
    });

    return createdNodes;
  }

  /**
   * Retrieves an atomic block node by its unique Block ID.
   */
  public getBlock(blockId: string): AtomicBlockNode | undefined {
    return this.blocks.get(blockId);
  }

  /**
   * Traverses and returns the entire parent ancestor chain for a specific block.
   */
  public getAncestorChain(blockId: string): AtomicBlockNode[] {
    const chain: AtomicBlockNode[] = [];
    let curr = this.getBlock(blockId);

    while (curr && curr.parentBlockId) {
      const parent = this.getBlock(curr.parentBlockId);
      if (parent) {
        chain.unshift(parent);
        curr = parent;
      } else {
        break;
      }
    }
    return chain;
  }

  /**
   * Returns all incoming graph edges (backlinks) pointing to a target page or block ID.
   */
  public getIncomingBacklinks(targetId: string): BlockGraphEdge[] {
    return this.edges.filter((e) => e.targetId === targetId);
  }

  /**
   * Export complete atomic block graph JSON
   */
  public toJSON() {
    return {
      totalBlocks: this.blocks.size,
      totalEdges: this.edges.length,
      blocks: Array.from(this.blocks.values()),
      edges: this.edges,
    };
  }
}
