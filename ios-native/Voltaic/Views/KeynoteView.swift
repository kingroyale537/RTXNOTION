// ios-native/Voltaic/Views/KeynoteView.swift
// Native SwiftUI One-Tap Keynote Presentation Deck View

import SwiftUI

public struct NativeKeynoteView: View {
    @Environment(\.dismiss) var dismiss
    @State private var currentSlide: Int = 0
    
    let slides: [(title: String, subtitle: String, points: [String])] = [
        (
            title: "Voltaic Native iOS & Mac",
            subtitle: "100% Swift & SwiftUI Zero-Friction Workspace",
            points: [
                "Sub-10ms Yjs CRDT document synchronization",
                "Steve Jobs Ambient Voice-to-Knowledge engine",
                "8:00 AM Proactive Executive Digest",
                "Hardware-backed zero-knowledge vault"
            ]
        ),
        (
            title: "Insanely Great Performance",
            subtitle: "Local-first architecture that feels instant",
            points: [
                "100% functional offline with background sync",
                "Native iOS keyboard formatting toolbar",
                "Threaded inline comments & real-time presence",
                "Multi-model AI integration (Gemini & GPT-4o)"
            ]
        )
    ]
    
    public var body: some View {
        ZStack {
            Color.black.ignoresSafeArea()
            
            VStack(alignment: .leading, spacing: 24) {
                // Header
                HStack {
                    HStack(spacing: 8) {
                        Text("⚡")
                            .font(.title3)
                        Text("Keynote Mode")
                            .font(.subheadline)
                            .foregroundColor(.gray)
                    }
                    Spacer()
                    Button(action: { dismiss() }) {
                        Image(systemName: "xmark.circle.fill")
                            .font(.title2)
                            .foregroundColor(.gray)
                    }
                }
                
                Spacer()
                
                // Current Slide
                let slide = slides[currentSlide]
                VStack(alignment: .leading, spacing: 16) {
                    RoundedRectangle(cornerRadius: 3)
                        .fill(LinearGradient(colors: [.indigo, .purple], startPoint: .leading, endPoint: .trailing))
                        .frame(width: 80, height: 6)
                    
                    Text(slide.title)
                        .font(.system(size: 38, weight: .bold))
                        .foregroundColor(.white)
                    
                    Text(slide.subtitle)
                        .font(.title3)
                        .foregroundColor(.gray)
                    
                    Divider().background(Color.gray.opacity(0.4))
                        .padding(.vertical, 8)
                    
                    ForEach(slide.points, id: \.self) { pt in
                        HStack(alignment: .top, spacing: 12) {
                            Circle()
                                .fill(Color.indigo)
                                .frame(width: 8, height: 8)
                                .padding(.top, 8)
                            Text(pt)
                                .font(.title3)
                                .foregroundColor(.white.opacity(0.9))
                        }
                    }
                }
                
                Spacer()
                
                // Navigation Bar
                HStack {
                    Button(action: { if currentSlide > 0 { currentSlide -= 1 } }) {
                        Image(systemName: "chevron.left.circle.fill")
                            .font(.title)
                            .foregroundColor(currentSlide > 0 ? .white : .gray.opacity(0.3))
                    }
                    .disabled(currentSlide == 0)
                    
                    Spacer()
                    
                    Text("\(currentSlide + 1) / \(slides.count)")
                        .font(.caption)
                        .foregroundColor(.gray)
                    
                    Spacer()
                    
                    Button(action: { if currentSlide < slides.count - 1 { currentSlide += 1 } }) {
                        Image(systemName: "chevron.right.circle.fill")
                            .font(.title)
                            .foregroundColor(currentSlide < slides.count - 1 ? .indigo : .gray.opacity(0.3))
                    }
                    .disabled(currentSlide == slides.count - 1)
                }
            }
            .padding(24)
        }
    }
}
