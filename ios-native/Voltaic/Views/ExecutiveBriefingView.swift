// ios-native/Voltaic/Views/ExecutiveBriefingView.swift
// Native SwiftUI Executive Briefing Dashboard View

import SwiftUI

public struct ExecutiveBriefingView: View {
    @ObservedObject var aiService = VoltaicAIService.shared
    @Environment(\.dismiss) var dismiss
    @State private var digest: ExecutiveDigest? = nil
    
    public var body: some View {
        NavigationStack {
            ZStack {
                Color(red: 0.05, green: 0.05, blue: 0.07).ignoresSafeArea()
                
                ScrollView {
                    VStack(spacing: 24) {
                        if let d = digest {
                            // Key Metrics Row
                            HStack(spacing: 12) {
                                MetricCard(title: "Tasks Done", value: "\(d.tasksCompleted)", color: Color(red: 0.5, green: 0.5, blue: 1.0))
                                MetricCard(title: "Sync Speed", value: d.syncEfficiency, color: Color(red: 0.2, green: 0.85, blue: 0.6))
                                MetricCard(title: "Pages Active", value: "\(d.activePages)", color: Color(red: 0.8, green: 0.4, blue: 1.0))
                            }
                            .padding(.horizontal)
                            
                            // Workspace Summary Card
                            VStack(alignment: .leading, spacing: 12) {
                                HStack(spacing: 8) {
                                    Image(systemName: "chart.line.uptrend.xyaxis")
                                        .foregroundColor(Color(red: 0.5, green: 0.5, blue: 1.0))
                                    Text("Workspace Momentum")
                                        .font(.headline)
                                        .foregroundColor(.white)
                                }
                                
                                Text(d.summary)
                                    .font(.subheadline)
                                    .foregroundColor(Color(white: 0.85))
                                    .lineSpacing(5)
                            }
                            .padding(18)
                            .frame(maxWidth: .infinity, alignment: .leading)
                            .background(Color(red: 0.12, green: 0.12, blue: 0.18))
                            .cornerRadius(18)
                            .overlay(RoundedRectangle(cornerRadius: 18).stroke(Color.indigo.opacity(0.4), lineWidth: 1))
                            .padding(.horizontal)
                            
                            // Decision Needed Section
                            VStack(alignment: .leading, spacing: 14) {
                                Text("PENDING EXECUTIVE DECISIONS")
                                    .font(.caption)
                                    .bold()
                                    .foregroundColor(Color(white: 0.6))
                                    .tracking(1.0)
                                
                                ForEach(d.decisions, id: \.self) { dec in
                                    HStack(spacing: 12) {
                                        Image(systemName: "exclamationmark.triangle.fill")
                                            .foregroundColor(.orange)
                                            .font(.title3)
                                        Text(dec)
                                            .font(.subheadline)
                                            .bold()
                                            .foregroundColor(.white)
                                        Spacer()
                                        Image(systemName: "chevron.right")
                                            .font(.caption)
                                            .foregroundColor(Color(white: 0.5))
                                    }
                                    .padding(16)
                                    .background(Color(red: 0.1, green: 0.1, blue: 0.14))
                                    .cornerRadius(14)
                                    .overlay(RoundedRectangle(cornerRadius: 14).stroke(Color(white: 0.15), lineWidth: 1))
                                }
                            }
                            .padding(.horizontal)
                        } else {
                            ProgressView("Loading 8:00 AM Digest...")
                                .tint(.white)
                                .foregroundColor(.white)
                                .padding(.top, 40)
                        }
                    }
                    .padding(.vertical, 16)
                }
            }
            .navigationTitle("8:00 AM Executive Digest")
            .navigationBarTitleDisplayMode(.inline)
            .toolbarBackground(Color(red: 0.05, green: 0.05, blue: 0.07), for: .navigationBar)
            .toolbarColorScheme(.dark, for: .navigationBar)
            .toolbar {
                ToolbarItem(placement: .navigationBarTrailing) {
                    Button(action: { dismiss() }) {
                        Image(systemName: "xmark.circle.fill")
                            .font(.title3)
                            .foregroundColor(Color(white: 0.6))
                    }
                }
            }
            .onAppear {
                aiService.fetchExecutiveDigest { result in
                    self.digest = result
                }
            }
        }
        .preferredColorScheme(.dark)
    }
}

public struct MetricCard: View {
    let title: String
    let value: String
    let color: Color
    
    public var body: some View {
        VStack(spacing: 6) {
            Text(value)
                .font(.title2)
                .bold()
                .foregroundColor(color)
            Text(title)
                .font(.caption)
                .bold()
                .foregroundColor(Color(white: 0.7))
        }
        .frame(maxWidth: .infinity)
        .padding(.vertical, 18)
        .background(Color(red: 0.1, green: 0.1, blue: 0.14))
        .cornerRadius(14)
        .overlay(RoundedRectangle(cornerRadius: 14).stroke(Color(white: 0.15), lineWidth: 1))
    }
}
