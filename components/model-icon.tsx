import { Anthropic, OpenAI } from "@lobehub/icons";

export default function ReturnModelIcon(modelProvider: string | undefined) {
  switch (modelProvider) {
    case "OpenAI":
      return <OpenAI />;
      break;
    case "Claude":
      return <Anthropic />;
      break;
    default:
      return (
        <div className="flex-shrink-0 w-2 h-2 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full"></div>
      );
      break;
  }
}