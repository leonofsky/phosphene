import { createFileRoute } from "@tanstack/react-router";
import { SceneView } from "@/components/scene-view";

export const Route = createFileRoute("/")({ component: Home });

function Home() {
  return <SceneView />;
}
