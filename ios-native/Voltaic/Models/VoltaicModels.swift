// ios-native/Voltaic/Models/VoltaicModels.swift
// Voltaic Native Swift Data Models matching Prisma Schema

import Foundation

// MARK: - Enums
public enum Role: String, Codable, CaseIterable {
    case admin = "ADMIN"
    case editor = "EDITOR"
    case viewer = "VIEWER"
}

public enum PageIconType: String, Codable {
    case emoji = "EMOJI"
    case url = "URL"
    case lucide = "LUCIDE"
}

public enum ActivityType: String, Codable {
    case pageCreated = "PAGE_CREATED"
    case pageUpdated = "PAGE_UPDATED"
    case pageDeleted = "PAGE_DELETED"
    case commentAdded = "COMMENT_ADDED"
    case memberJoined = "MEMBER_JOINED"
}

// MARK: - Core Models
public struct User: Identifiable, Codable {
    public let id: String
    public var name: String?
    public let email: String
    public var image: String?
    public var bio: String?
    public var color: String
    public let createdAt: Date?
}

public struct Workspace: Identifiable, Codable {
    public let id: String
    public var name: String
    public let slug: String
    public var description: String?
    public var logo: String?
    public var isPersonal: Bool
    public var plan: String
    public let ownerId: String
}

public struct WorkspaceMember: Identifiable, Codable {
    public let id: String
    public let workspaceId: String
    public let userId: String
    public var role: Role
    public var user: User?
}

public struct Page: Identifiable, Codable {
    public let id: String
    public var title: String
    public var contentText: String?
    public var emoji: String?
    public var iconType: PageIconType
    public var coverImage: String?
    public var isPublished: Bool
    public var isFavorite: Bool
    public var isArchived: Bool
    public var sortOrder: Double
    public let workspaceId: String
    public var parentId: String?
    public let createdById: String
    public var children: [Page]?
}

public struct PagePresence: Identifiable, Codable {
    public var id: String { "\(pageId)-\(userId)" }
    public let pageId: String
    public let userId: String
    public var userName: String
    public var userColor: String
    public var userImage: String?
    public var cursorAnchor: Int?
    public var cursorHead: Int?
}

public struct Comment: Identifiable, Codable {
    public let id: String
    public let pageId: String
    public let authorId: String
    public var content: String
    public var blockId: String?
    public var isResolved: Bool
    public let createdAt: Date
    public var author: User?
}

public struct DatabaseRow: Identifiable, Codable {
    public let id: String
    public let databaseId: String
    public var title: String
    public var status: String
    public var priority: String
    public var dueDate: String?
}

public struct ExecutiveDigest: Codable {
    public let tasksCompleted: Int
    public let syncEfficiency: String
    public let activePages: Int
    public let summary: String
    public let decisions: [String]
}
