import { Button, ButtonProps } from "@heroui/button";
import { useEffect } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import MdiArrowLeft from "~icons/mdi/arrow-left";

interface PreviousButtonProps extends Partial<ButtonProps> {
  shortcuts?: string[];
}

export default function PreviousButton({
  shortcuts = ["Backspace"],
  ...rest
}: Readonly<PreviousButtonProps>) {
  const navigate = useNavigate();
  const { t } = useTranslation();

  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (shortcuts.includes(e.key)) {
        e.preventDefault();
        navigate(-1);
      }
    };

    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [navigate, shortcuts]);

  return (
    <Button
      onPress={() => navigate(-1)}
      className="items-center gap-2"
      {...rest}
      startContent={<MdiArrowLeft />}
    >
      {t("Common.Back")}
    </Button>
  );
}
