import { describe, it, expect, vi } from "vitest";
import { RxResumeClient } from "../src/index.js";

const BASE_URL = "https://rxresu.me";
const API_KEY = "test-api-key";

describe("AgentAPI", () => {
  it("should handle all agent thread and message operations", async () => {
    const mockFetch = vi
      .fn()
      // list_threads
      .mockResolvedValueOnce(
        new Response(JSON.stringify([{ id: "thread-1" }]), {
          status: 200,
          headers: { "Content-Type": "application/json" },
        })
      )
      // get_thread
      .mockResolvedValueOnce(
        new Response(JSON.stringify({ id: "thread-1", messages: [] }), {
          status: 200,
          headers: { "Content-Type": "application/json" },
        })
      )
      // delete_thread
      .mockResolvedValueOnce(new Response(null, { status: 204 }))
      // create_thread
      .mockResolvedValueOnce(
        new Response(JSON.stringify({ id: "new-thread" }), {
          status: 201,
          headers: { "Content-Type": "application/json" },
        })
      )
      // get_or_create_thread_for_resume
      .mockResolvedValueOnce(
        new Response(JSON.stringify({ id: "resume-thread" }), {
          status: 200,
          headers: { "Content-Type": "application/json" },
        })
      )
      // send_message
      .mockResolvedValueOnce(
        new Response(JSON.stringify({ success: true }), {
          status: 200,
          headers: { "Content-Type": "application/json" },
        })
      )
      // archive_thread
      .mockResolvedValueOnce(
        new Response(JSON.stringify({ archived: true }), {
          status: 200,
          headers: { "Content-Type": "application/json" },
        })
      )
      // stop_run
      .mockResolvedValueOnce(
        new Response(JSON.stringify({ stopped: true }), {
          status: 200,
          headers: { "Content-Type": "application/json" },
        })
      )
      // resume_message_stream
      .mockResolvedValueOnce(
        new Response(new TextEncoder().encode("stream-data"), {
          status: 200,
          headers: { "Content-Type": "text/plain" },
        })
      )
      // create_attachment
      .mockResolvedValueOnce(
        new Response(JSON.stringify({ id: "attachment-1" }), {
          status: 201,
          headers: { "Content-Type": "application/json" },
        })
      )
      // delete_attachment
      .mockResolvedValueOnce(new Response(null, { status: 204 }))
      // revert_action
      .mockResolvedValueOnce(
        new Response(JSON.stringify({ reverted: true }), {
          status: 200,
          headers: { "Content-Type": "application/json" },
        })
      );

    const client = new RxResumeClient({ baseUrl: BASE_URL, apiKey: API_KEY, fetch: mockFetch });

    const threads = await client.agent.listThreads();
    expect(threads).toHaveLength(1);
    expect(threads[0].id).toBe("thread-1");

    const thread = await client.agent.getThread("thread-1");
    expect(thread.id).toBe("thread-1");

    await client.agent.deleteThread("thread-1");

    const newT = await client.agent.createThread({ aiProviderId: "provider-1" });
    expect(newT.id).toBe("new-thread");

    const rt = await client.agent.getOrCreateThreadForResume({ sourceResumeId: "resume-1" });
    expect(rt.id).toBe("resume-thread");

    const sent = await client.agent.sendMessage("thread-1", "hello");
    expect(sent.success).toBe(true);

    const arch = await client.agent.archiveThread("thread-1");
    expect(arch.archived).toBe(true);

    const stopped = await client.agent.stopRun("thread-1");
    expect(stopped.stopped).toBe(true);

    const stream = await client.agent.resumeMessageStream("thread-1");
    expect(stream).toBeInstanceOf(Uint8Array);

    const att = await client.agent.createAttachment(
      "thread-1",
      "file.pdf",
      "application/pdf",
      "data"
    );
    expect(att.id).toBe("attachment-1");

    await client.agent.deleteAttachment("attachment-1");

    const rev = await client.agent.revertAction("action-1");
    expect(rev.reverted).toBe(true);
  });
});
