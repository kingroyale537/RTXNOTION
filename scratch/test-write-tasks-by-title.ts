import { McpRouter } from "../src/services/mcpRouter";

async function run() {
  const mcpRouter = new McpRouter({
    workspaceId: "cmrhlp3ak0003d51w7duik4te", // Correct workspace ID for Tasks page
    userId: "cmrhlp2xj0001d51wyp19n7wz", // Correct user ID
  });

  console.log("Calling writeToPage with 'Tasks' (title)...");
  try {
    const result = await mcpRouter.writeToPage("Tasks", "MERN Stack Info:\n- MongoDB\n- Express.js\n- React\n- Node.js");
    console.log("Result:", result);
  } catch (err) {
    console.error("Error writing to page:", err);
  }
}

run().catch(console.error);
