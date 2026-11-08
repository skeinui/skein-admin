import { Button } from "@skeinui/ui";
import { CircleHelp } from "lucide-react";
import { useToolbarTranslation } from "./locales";

/** An app's own tool (registered as "help" in tools.tsx): opens the documentation in a new tab. */
export function HelpLink() {
  const { t } = useToolbarTranslation();
  return (
    <Button
      variant="ghost"
      color="neutral"
      size="sm"
      iconOnly
      aria-label={t("help")}
      onClick={() => window.open("https://skeinui.com", "_blank", "noopener")}
    >
      <CircleHelp size={16} />
    </Button>
  );
}
