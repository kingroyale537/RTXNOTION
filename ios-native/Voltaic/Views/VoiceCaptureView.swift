// ios-native/Voltaic/Views/VoiceCaptureView.swift
// Native SwiftUI Voice-to-Knowledge Visualizer View

import SwiftUI

public struct VoiceCaptureView: View {
    @ObservedObject var aiService = VoltaicAIService.shared
    @Environment(\.dismiss) var dismiss
    
    @State private var isRecording: Bool = false
    @State private var timerCount: Int = 0
    @State private var resultPage: Page? = nil
    @State private var tasks: [String] = []
    
    let timer = Timer.publish(every: 1, on: .main, in: .common).autoconnect()
    
    public var body: some View {
        VStack(spacing: 24) {
            HStack {
                Label("Voice-to-Knowledge", systemImage: "sparkles")
                    .font(.headline)
                    .foregroundColor(.indigo)
                Spacer()
                Button(action: { dismiss() }) {
                    Image(systemName: "xmark.circle.fill")
                        .font(.title2)
                        .foregroundColor(.gray)
                }
            }
            .padding()
            
            Spacer()
            
            if !isRecording && !aiService.isProcessing && resultPage == nil {
                VStack(spacing: 16) {
                    Button(action: startRecording) {
                        ZStack {
                            Circle()
                                .fill(LinearGradient(colors: [.indigo, .purple, .pink], startPoint: .topLeading, endPoint: .bottomTrailing))
                                .frame(width: 100, height: 100)
                                .shadow(color: .indigo.opacity(0.4), radius: 12, x: 0, y: 6)
                            
                            Image(systemName: "mic.fill")
                                .font(.system(size: 40))
                                .foregroundColor(.white)
                        }
                    }
                    
                    Text("Tap to record raw thought")
                        .font(.headline)
                    Text("Voltaic AI automatically extracts tasks & notes")
                        .font(.caption)
                        .foregroundColor(.secondary)
                }
            } else if isRecording {
                VStack(spacing: 20) {
                    HStack(spacing: 4) {
                        ForEach(0..<8) { i in
                            RoundedRectangle(cornerRadius: 4)
                                .fill(Color.indigo)
                                .frame(width: 6, height: CGFloat.random(in: 20...60))
                                .animation(.easeInOut(duration: 0.3).repeatForever(), value: isRecording)
                        }
                    }
                    .frame(height: 70)
                    
                    Text("00:\(timerCount < 10 ? "0" : "")\(timerCount)")
                        .font(.system(.title, design: .monospaced))
                        .bold()
                    
                    Button(action: stopRecording) {
                        HStack {
                            Image(systemName: "square.fill")
                            Text("Stop & Convert")
                        }
                        .padding(.horizontal, 24)
                        .padding(.vertical, 12)
                        .background(Color.red)
                        .foregroundColor(.white)
                        .cornerRadius(24)
                    }
                }
                .onReceive(timer) { _ in
                    if isRecording { timerCount += 1 }
                }
            } else if aiService.isProcessing {
                VStack(spacing: 16) {
                    ProgressView()
                        .scaleEffect(1.5)
                    Text("Synthesizing voice note with Gemini 2.5 Flash...")
                        .font(.subheadline)
                        .foregroundColor(.secondary)
                }
            } else if let page = resultPage {
                VStack(alignment: .leading, spacing: 14) {
                    Text("Generated Page")
                        .font(.caption)
                        .bold()
                        .foregroundColor(.indigo)
                    
                    Text(page.title)
                        .font(.title3)
                        .bold()
                    
                    Text(page.contentText ?? "")
                        .font(.body)
                        .foregroundColor(.secondary)
                    
                    Divider()
                    
                    Text("Extracted Tasks:")
                        .font(.caption)
                        .bold()
                    
                    ForEach(tasks, id: \.self) { task in
                        HStack {
                            Image(systemName: "checkmark.circle.fill")
                                .foregroundColor(.emerald)
                            Text(task)
                                .font(.subheadline)
                        }
                    }
                    
                    Button("Save to Workspace") {
                        dismiss()
                    }
                    .buttonStyle(.borderedProminent)
                    .tint(.indigo)
                    .padding(.top, 8)
                }
                .padding()
                .background(Color(UIColor.secondarySystemBackground))
                .cornerRadius(16)
                .padding(.horizontal)
            }
            
            Spacer()
        }
    }
    
    func startRecording() {
        isRecording = true
        timerCount = 0
    }
    
    func stopRecording() {
        isRecording = false
        aiService.processVoiceCapture(audioTranscript: "Finalize Voltaic native SwiftUI iOS app, connect URLSession sync engine, and prepare Apple App Store submission.") { page, extractedTasks in
            self.resultPage = page
            self.tasks = extractedTasks
        }
    }
}
