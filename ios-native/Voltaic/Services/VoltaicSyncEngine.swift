// ios-native/Voltaic/Services/VoltaicSyncEngine.swift
// Native Swift Sync Engine connecting REST API & WebSockets with Voltaic Server

import Foundation
import Combine

public class VoltaicSyncEngine: ObservableObject {
    public static let shared = VoltaicSyncEngine()
    
    @Published public var baseURL: String = "http://192.168.0.101:3002"
    @Published public var wsURL: String = "ws://192.168.0.101:3001"
    @Published public var isConnected: Bool = false
    @Published public var currentWorkspace: Workspace?
    @Published public var pages: [Page] = []
    @Published public var activePresence: [PagePresence] = []
    
    private var webSocketTask: URLSessionWebSocketTask?
    private var cancellables = Set<AnyCancellable>()
    
    public init() {
        setupDemoWorkspace()
    }
    
    public func setupDemoWorkspace() {
        self.currentWorkspace = Workspace(
            id: "ws-demo-123",
            name: "Voltaic Team",
            slug: "voltaic-team",
            description: "Collaborative Workspace",
            logo: "⚡",
            isPersonal: false,
            plan: "enterprise",
            ownerId: "user-1"
        )
        
        self.pages = [
            Page(id: "page-1", title: "Product Strategy & iOS Roadmap", contentText: "Native Swift app architecture with zero-latency sync engine.", emoji: "🚀", iconType: .emoji, coverImage: nil, isPublished: true, isFavorite: true, isArchived: false, sortOrder: 1.0, workspaceId: "ws-demo-123", parentId: nil, createdById: "user-1", children: nil),
            Page(id: "page-2", title: "Steve Jobs Feature Spec", contentText: "Ambient Voice-to-Knowledge capture, 8:00 AM Executive Digest, and Keynote presentation deck.", emoji: "💡", iconType: .emoji, coverImage: nil, isPublished: false, isFavorite: true, isArchived: false, sortOrder: 2.0, workspaceId: "ws-demo-123", parentId: nil, createdById: "user-1", children: nil),
            Page(id: "page-3", title: "Team Sprint Backlog", contentText: "1. Build native SwiftUI components\n2. Integrate URLSession WebSocket engine\n3. Connect SQLite local cache", emoji: "📋", iconType: .emoji, coverImage: nil, isPublished: false, isFavorite: false, isArchived: false, sortOrder: 3.0, workspaceId: "ws-demo-123", parentId: nil, createdById: "user-1", children: nil)
        ]
    }
    
    // MARK: - WebSocket Connection
    public func connectWebSocket(pageId: String, userId: String, userName: String) {
        guard let url = URL(string: "\(wsURL)/socket.io/?EIO=4&transport=websocket") else { return }
        let session = URLSession(configuration: .default)
        let task = session.webSocketTask(with: url)
        self.webSocketTask = task
        task.resume()
        self.isConnected = true
        
        sendJoinPageEvent(pageId: pageId, userId: userId, userName: userName)
        receiveMessages()
    }
    
    private func sendJoinPageEvent(pageId: String, userId: String, userName: String) {
        let joinPayload: [String: Any] = [
            "event": "join-page",
            "pageId": pageId,
            "userId": userId,
            "name": userName,
            "color": "#6366f1"
        ]
        if let data = try? JSONSerialization.data(withJSONObject: joinPayload),
           let jsonString = String(data: data, encoding: .utf8) {
            webSocketTask?.send(.string(jsonString)) { error in
                if let error = error {
                    print("[SyncEngine] WebSocket send error: \(error.localizedDescription)")
                }
            }
        }
    }
    
    private func receiveMessages() {
        webSocketTask?.receive { [weak self] result in
            switch result {
            case .success(let message):
                switch message {
                case .string(let text):
                    self?.handleIncomingMessage(text)
                case .data(let data):
                    print("[SyncEngine] Received binary update: \(data.count) bytes")
                @unknown default:
                    break
                }
                self?.receiveMessages()
            case .failure(let error):
                print("[SyncEngine] WebSocket receive failed: \(error.localizedDescription)")
                DispatchQueue.main.async {
                    self?.isConnected = false
                }
            }
        }
    }
    
    private func handleIncomingMessage(_ text: String) {
        // Parse incoming Socket.io presence or Yjs update
        print("[SyncEngine] Incoming WS message: \(text.prefix(60))...")
    }
    
    public func disconnect() {
        webSocketTask?.cancel(with: .normalClosure, reason: nil)
        self.isConnected = false
    }
}
