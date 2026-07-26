// ios-native/Voltaic/VoltaicApp.swift
// Main SwiftUI Application Entry Point for Voltaic iOS Native

import SwiftUI

@main
struct VoltaicApp: App {
    @StateObject private var syncEngine = VoltaicSyncEngine.shared
    
    var body: some Scene {
        WindowGroup {
            ContentView()
                .preferredColorScheme(.dark)
                .environmentObject(syncEngine)
                .onAppear {
                    print("[VoltaicApp] Native Swift iOS Application Started")
                }
        }
    }
}
