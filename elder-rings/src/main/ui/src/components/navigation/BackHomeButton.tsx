import { Button, ButtonProps } from "@heroui/react";
import { Ref, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import MdiHomeOutline from "~icons/mdi/home-outline";

interface BackHomeButtonProps extends Partial<ButtonProps> {
  shortcuts?: string[];
  ref?: Ref<HTMLButtonElement>;
}

export default function BackHomeButton({
  shortcuts = [],
  ref,
  ...rest
}: Readonly<BackHomeButtonProps>) {
  const navigate = useNavigate();
  const { t } = useTranslation();

  useEffect(() => {
    if (shortcuts.length === 0) return;

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
      ref={ref}
      onPress={() => navigate("/")}
      className="items-center gap-2"
      variant="secondary"
      {...rest}
    >
      <MdiHomeOutline />
      {t("Common.GoBackHome")}
    </Button>
  );
}
