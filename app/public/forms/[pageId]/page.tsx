// app/public/forms/[pageId]/page.tsx
// Public Notion-style Form Portal Page.
// Renders clean form fields mapped directly to database properties.

"use client";

import { useState, useEffect } from "react";
import { Send, CheckCircle2, FileText, Sparkles } from "lucide-react";
import toast, { Toaster } from "react-hot-toast";

interface Props {
  params: {
    pageId: string;
  };
}

export default function PublicFormPage({ params }: Props) {
  const { pageId } = params;
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [formData, setFormData] = useState({
    title: "",
    status: "To Do",
    priority: "Medium",
    date: new Date().toISOString().split("T")[0],
    assignee: "",
    responseText: "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title.trim()) {
      toast.error("Please enter a title or response name.");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch(`/api/forms/${pageId}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || "Failed to submit response");
      }

      setSubmitted(true);
      toast.success("Response submitted successfully!");
    } catch (err: any) {
      toast.error(err.message || "Something went wrong.");
    } finally {
      setLoading(false);
    }
  };

  if (submitted) {
    return (
      <div className="min-h-screen bg-[#121212] text-white flex flex-col items-center justify-center p-6">
        <Toaster position="top-center" />
        <div className="max-w-md w-full bg-[#1e1e1e] border border-[#2e2e2e] rounded-2xl p-8 text-center shadow-2xl space-y-4">
          <div className="w-16 h-16 bg-blue-500/10 text-blue-400 rounded-full flex items-center justify-center mx-auto">
            <CheckCircle2 className="w-10 h-10" />
          </div>
          <h1 className="text-2xl font-bold">Response Submitted!</h1>
          <p className="text-sm text-gray-400">
            Thank you for filling out this form. Your entry has been recorded directly into the Voltaic database.
          </p>
          <button
            onClick={() => {
              setSubmitted(false);
              setFormData({
                title: "",
                status: "To Do",
                priority: "Medium",
                date: new Date().toISOString().split("T")[0],
                assignee: "",
                responseText: "",
              });
            }}
            className="w-full bg-[#2a2a2a] hover:bg-[#333] text-sm font-semibold py-2.5 rounded-xl transition"
          >
            Submit Another Response
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#121212] text-white flex flex-col items-center justify-center p-4 md:p-10">
      <Toaster position="top-center" />
      <div className="max-w-xl w-full bg-[#1a1a1a] border border-[#2a2a2a] rounded-2xl p-6 md:p-8 shadow-2xl space-y-6">
        <div className="flex items-center gap-3 border-b border-[#2a2a2a] pb-5">
          <div className="p-3 bg-blue-600/10 rounded-xl text-blue-400">
            <FileText className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-xl md:text-2xl font-bold">Database Form</h1>
            <p className="text-xs text-gray-400 flex items-center gap-1 mt-0.5">
              <span>Powered by Voltaic Workspace</span>
              <Sparkles className="w-3 h-3 text-purple-400" />
            </p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 text-sm">
          <div>
            <label className="block text-xs font-semibold text-gray-300 mb-1.5">
              Entry Title / Subject <span className="text-red-400">*</span>
            </label>
            <input
              type="text"
              required
              placeholder="e.g. Bug Report, Feature Request, Feedback..."
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              className="w-full bg-[#222] border border-[#333] rounded-xl px-3.5 py-2.5 text-white outline-none focus:border-blue-500 transition"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-gray-300 mb-1.5">Status</label>
              <select
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                className="w-full bg-[#222] border border-[#333] rounded-xl px-3 py-2 text-white outline-none focus:border-blue-500 transition"
              >
                <option value="To Do">To Do</option>
                <option value="In Progress">In Progress</option>
                <option value="Done">Done</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-300 mb-1.5">Priority</label>
              <select
                value={formData.priority}
                onChange={(e) => setFormData({ ...formData, priority: e.target.value })}
                className="w-full bg-[#222] border border-[#333] rounded-xl px-3 py-2 text-white outline-none focus:border-blue-500 transition"
              >
                <option value="Low">Low</option>
                <option value="Medium">Medium</option>
                <option value="High">High</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-300 mb-1.5">Target Date</label>
            <input
              type="date"
              value={formData.date}
              onChange={(e) => setFormData({ ...formData, date: e.target.value })}
              className="w-full bg-[#222] border border-[#333] rounded-xl px-3.5 py-2 text-white outline-none focus:border-blue-500 transition"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-300 mb-1.5">Submitted By / Email</label>
            <input
              type="text"
              placeholder="e.g. alex@acme.com"
              value={formData.assignee}
              onChange={(e) => setFormData({ ...formData, assignee: e.target.value })}
              className="w-full bg-[#222] border border-[#333] rounded-xl px-3.5 py-2.5 text-white outline-none focus:border-blue-500 transition"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-300 mb-1.5">Detailed Response / Description</label>
            <textarea
              rows={4}
              placeholder="Provide any additional notes or instructions..."
              value={formData.responseText}
              onChange={(e) => setFormData({ ...formData, responseText: e.target.value })}
              className="w-full bg-[#222] border border-[#333] rounded-xl p-3 text-white outline-none focus:border-blue-500 transition resize-none"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 hover:bg-blue-500 text-white font-bold py-3 rounded-xl transition flex items-center justify-center gap-2 shadow-lg disabled:opacity-50 mt-2"
          >
            <Send className="w-4 h-4" />
            <span>{loading ? "Submitting..." : "Submit Form Response"}</span>
          </button>
        </form>
      </div>
    </div>
  );
}
