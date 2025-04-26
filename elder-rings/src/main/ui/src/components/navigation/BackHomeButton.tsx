import { Button, ButtonProps } from "@heroui/button";
import { useEffect } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import MdiHomeOutline from "~icons/mdi/home-outline";

interface BackHomeButtonProps extends Partial<ButtonProps> {
  shortcuts?: string[];
}

export default function BackHomeButton({
  shortcuts = ["h"],
  ...rest
}: Readonly<BackHomeButtonProps>) {
  const navigate = useNavigate();
  const { t } = useTranslation();

  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (shortcuts.includes(e.key)) {
        e.preventDefault();
        navigate("/");
      }
    };

    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [navigate, shortcuts]);

  return (
    <Button
      onPress={() => navigate("/")}
      className="items-center gap-2"
      variant="light"
      startContent={<MdiHomeOutline />}
      {...rest}
    >
      {t("Common.GoBackHome")}
    </Button>
  );
}
