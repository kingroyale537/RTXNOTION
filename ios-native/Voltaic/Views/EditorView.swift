// ios-native/Voltaic/Views/EditorView.swift
// Native SwiftUI Rich Text & Block Editor View

import SwiftUI

public struct EditorView: View {
    @Binding var page: Page
    @State private var textContent: String = ""
    @State private var isBold: Bool = false
    @State private var isItalic: Bool = false
    @State private var showBlockPicker: Bool = false
    
    public var body: some View {
        ZStack {
            Color(red: 0.08, green: 0.08, blue: 0.1).ignoresSafeArea()
            
            VStack(spacing: 0) {
                // Page Header (Emoji + Title)
                ScrollView {
                    VStack(alignment: .leading, spacing: 16) {
                        HStack(spacing: 12) {
                            Text(page.emoji ?? "📄")
                                .font(.system(size: 44))
                            
                            TextField("Page Title", text: $page.title)
                                .font(.title)
                                .bold()
                                .foregroundColor(.white)
                        }
                        .padding(.horizontal)
                        .padding(.top, 16)
                        
                        Divider()
                            .background(Color(white: 0.2))
                            .padding(.horizontal)
                        
                        // Main Editor Content Area
                        TextEditor(text: $textContent)
                            .font(.body)
                            .scrollContentBackground(.hidden)
                            .foregroundColor(.white)
                            .padding(.horizontal)
                            .frame(minHeight: 350)
                    }
                }
                
                // Contextual Keyboard Formatting Toolbar
                HStack(spacing: 16) {
                    Button(action: { showBlockPicker = true }) {
                        Image(systemName: "plus.circle.fill")
                            .font(.title2)
                            .foregroundColor(.indigo)
                    }
                    
                    Divider().frame(height: 20)
                    
                    Button(action: { isBold.toggle() }) {
                        Image(systemName: "bold")
                            .foregroundColor(isBold ? .indigo : .white)
                    }
                    
                    Button(action: { isItalic.toggle() }) {
                        Image(systemName: "italic")
                            .foregroundColor(isItalic ? .indigo : .white)
                    }
                    
                    Button(action: { textContent += "\n# Heading 1\n" }) {
                        Text("H1").bold().font(.caption).foregroundColor(.white)
                    }
                    
                    Button(action: { textContent += "\n- [ ] New Task\n" }) {
                        Image(systemName: "checkmark.square")
                            .foregroundColor(.emerald)
                    }
                    
                    Button(action: { textContent += "\n```swift\n// Code snippet\n```\n" }) {
                        Image(systemName: "curlybraces")
                            .foregroundColor(.pink)
                    }
                    
                    Spacer()
                }
                .padding(.horizontal, 16)
                .padding(.vertical, 12)
                .background(Color(red: 0.12, green: 0.12, blue: 0.16))
                .border(Color(white: 0.2), width: 0.5)
            }
        }
        .onAppear {
            textContent = page.contentText ?? "Welcome to Voltaic Native Swift Editor!"
        }
        .sheet(isPresented: $showBlockPicker) {
            NativeBlockPickerView { selectedBlock in
                textContent += "\n\(selectedBlock)\n"
            }
        }
    }
}

public struct NativeBlockPickerView: View {
    var onSelect: (String) -> Void
    @Environment(\.dismiss) var dismiss
    
    public var body: some View {
        NavigationStack {
            List {
                Button("Heading 1") { onSelect("# "); dismiss() }
                Button("Heading 2") { onSelect("## "); dismiss() }
                Button("To-Do Task") { onSelect("- [ ] "); dismiss() }
                Button("Bulleted List") { onSelect("- "); dismiss() }
                Button("Code Block") { onSelect("```\n\n```"); dismiss() }
                Button("Quote Callout") { onSelect("> "); dismiss() }
            }
            .navigationTitle("Add Block")
            .navigationBarTitleDisplayMode(.inline)
        }
    }
}

extension Color {
    static let emerald = Color(red: 0.06, green: 0.73, blue: 0.5)
}
