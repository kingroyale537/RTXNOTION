// ios-native/Voltaic/ContentView.swift
// Main Native SwiftUI Root View with TabBar & Navigation

import SwiftUI

public struct ContentView: View {
    @ObservedObject var syncEngine = VoltaicSyncEngine.shared
    
    @State private var selectedPage: Page?
    @State private var showSidebar: Bool = false
    @State private var showVoiceCapture: Bool = false
    @State private var showExecutiveBriefing: Bool = false
    @State private var showKeynote: Bool = false
    
    public var body: some View {
        NavigationStack {
            VStack(spacing: 0) {
                if var page = selectedPage ?? syncEngine.pages.first {
                    EditorView(page: Binding(
                        get: { selectedPage ?? syncEngine.pages.first! },
                        set: { selectedPage = $0 }
                    ))
                } else {
                    ContentUnavailableView("No Page Selected", systemImage: "doc.text", description: Text("Select a page from the sidebar to start editing."))
                }
            }
            .navigationBarTitleDisplayMode(.inline)
            .toolbar {
                ToolbarItem(placement: .navigationBarLeading) {
                    Button(action: { showSidebar = true }) {
                        Image(systemName: "sidebar.left")
                            .foregroundColor(.primary)
                    }
                }
                
                ToolbarItem(placement: .principal) {
                    HStack(spacing: 6) {
                        Text(selectedPage?.emoji ?? "⚡")
                        Text(selectedPage?.title ?? "Voltaic")
                            .font(.headline)
                    }
                }
                
                ToolbarItem(placement: .navigationBarTrailing) {
                    HStack(spacing: 16) {
                        Button(action: { showExecutiveBriefing = true }) {
                            Image(systemName: "sparkles")
                                .foregroundColor(.indigo)
                        }
                        
                        Button(action: { showKeynote = true }) {
                            Image(systemName: "play.tv.fill")
                                .foregroundColor(.amber)
                        }
                    }
                }
            }
            
            // Native Floating Action Button for Voice Capture
            .overlay(alignment: .bottomTrailing) {
                Button(action: { showVoiceCapture = true }) {
                    Image(systemName: "mic.fill")
                        .font(.title2)
                        .foregroundColor(.white)
                        .padding(18)
                        .background(LinearGradient(colors: [.indigo, .purple, .pink], startPoint: .topLeading, endPoint: .bottomTrailing))
                        .clipShape(Circle())
                        .shadow(color: .indigo.opacity(0.4), radius: 8, x: 0, y: 4)
                }
                .padding(20)
            }
        }
        .sheet(isPresented: $showSidebar) {
            WorkspaceSidebarView(selectedPage: $selectedPage)
        }
        .sheet(isPresented: $showVoiceCapture) {
            VoiceCaptureView()
        }
        .sheet(isPresented: $showExecutiveBriefing) {
            ExecutiveBriefingView()
        }
        .fullScreenCover(isPresented: $showKeynote) {
            NativeKeynoteView()
        }
    }
}

extension Color {
    static let amber = Color(red: 0.95, green: 0.65, blue: 0.15)
}
