import { ReactNode } from "react";
import { Avatar, Card } from "@heroui/react";
import { Button, ButtonProps } from "@heroui/react/button";
import { ContactDto } from "@type/openapiTypes";

interface UserCardProps {
  user: ContactDto;
  actions: UserCardActionProps[];
  dndLabel?: string;
  pictureAlt?: string;
  /** overlay content positioned against the card, e.g. a corner badge */
  children?: ReactNode;
}

interface UserCardActionProps {
  onClick: () => void;
  label: string;
  icon: ReactNode;
  variant: ButtonProps["variant"];
  className?: string;
  isDisabled?: boolean;
}

export default function UserCard({
  user,
  actions,
  dndLabel,
  pictureAlt,
  children,
}: Readonly<UserCardProps>) {
  return (
    <Card className="items-center relative gap-4 p-6 overflow-visible">
      <Avatar className="size-24">
        <Avatar.Image
          src={user.picture ? `data:image/*;base64,${user.picture}` : undefined}
          alt={pictureAlt ?? `${user.firstName} ${user.lastName}`}
        />
        <Avatar.Fallback>
          {user.firstName?.[0]}
          {user.lastName?.[0]}
        </Avatar.Fallback>
      </Avatar>
      <Card.Content className="text-center">
        <Card.Title className="text-xl font-semibold">
          {user.firstName} {user.lastName}
        </Card.Title>
        {dndLabel && (
          <p className="mt-1 inline-flex items-center gap-2 bg-red-100 text-red-900 py-1 px-3 rounded-full text-sm">
            <span className="w-2.5 h-2.5 rounded-full bg-red-500 shrink-0" />
            {dndLabel}
          </p>
        )}
      </Card.Content>
      <Card.Footer className="flex gap-2">
        {actions.map((action) => (
          <Button
            key={action.label}
            onPress={action.onClick}
            variant={action.variant}
            className={action.className}
            isIconOnly
            isDisabled={action.isDisabled}
            aria-label={action.label}
          >
            {action.icon}
          </Button>
        ))}
      </Card.Footer>
      {children}
    </Card>
  );
}
