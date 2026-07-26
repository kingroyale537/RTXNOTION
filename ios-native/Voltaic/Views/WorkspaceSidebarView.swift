// ios-native/Voltaic/Views/WorkspaceSidebarView.swift
// Native SwiftUI Workspace Sidebar Drawer

import SwiftUI

public struct WorkspaceSidebarView: View {
    @ObservedObject var syncEngine = VoltaicSyncEngine.shared
    @Binding var selectedPage: Page?
    @Environment(\.dismiss) var dismiss
    
    public var body: some View {
        NavigationStack {
            List {
                Section(header: Text("Workspace").font(.caption).bold()) {
                    if let ws = syncEngine.currentWorkspace {
                        HStack(spacing: 12) {
                            Text(ws.logo ?? "⚡")
                                .font(.title2)
                                .padding(8)
                                .background(Color.indigo.opacity(0.2))
                                .cornerRadius(8)
                            
                            VStack(alignment: .leading, spacing: 2) {
                                Text(ws.name)
                                    .font(.headline)
                                Text("Collaborative Workspace")
                                    .font(.caption)
                                    .foregroundColor(.secondary)
                            }
                        }
                        .padding(.vertical, 4)
                    }
                }
                
                Section(header: Text("Favorites").font(.caption).bold()) {
                    ForEach(syncEngine.pages.filter { $0.isFavorite }) { page in
                        Button(action: {
                            selectedPage = page
                            dismiss()
                        }) {
                            HStack(spacing: 10) {
                                Image(systemName: "star.fill")
                                    .foregroundColor(.yellow)
                                    .font(.caption)
                                Text(page.emoji ?? "📄")
                                Text(page.title)
                                    .font(.subheadline)
                                    .foregroundColor(.primary)
                            }
                        }
                    }
                }
                
                Section(header: Text("Private Pages").font(.caption).bold()) {
                    ForEach(syncEngine.pages.filter { !$0.isFavorite }) { page in
                        Button(action: {
                            selectedPage = page
                            dismiss()
                        }) {
                            HStack(spacing: 10) {
                                Text(page.emoji ?? "📄")
                                Text(page.title)
                                    .font(.subheadline)
                                    .foregroundColor(.primary)
                            }
                        }
                    }
                }
            }
            .listStyle(.insetGrouped)
            .navigationTitle("Voltaic")
            .navigationBarTitleDisplayMode(.inline)
            .toolbar {
                ToolbarItem(placement: .navigationBarTrailing) {
                    Button(action: { dismiss() }) {
                        Image(systemName: "xmark.circle.fill")
                            .foregroundColor(.gray)
                    }
                }
            }
        }
    }
}
