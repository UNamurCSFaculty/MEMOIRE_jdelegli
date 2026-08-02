import { Avatar } from "@heroui/react/avatar";
import { Button, ButtonProps } from "@heroui/react/button";
import { ContactDto } from "@type/openapiTypes";

interface UserRowProps {
  user: ContactDto;
  actions: ActionProps[];
}

interface ActionProps {
  onClick: () => void;
  label: string;
  icon: React.ReactNode;
  variant: ButtonProps["variant"];
}

export default function UserRow({ user, actions }: Readonly<UserRowProps>) {
  return (
    <div className="flex items-center gap-4 bg-white/30 p-2 rounded-lg">
      <Avatar className="size-10">
        <Avatar.Image
          src={user.picture ? `data:image/*;base64,${user.picture}` : undefined}
          alt={`${user.firstName} ${user.lastName}`}
        />
        <Avatar.Fallback>
          {user.firstName?.[0]}
          {user.lastName?.[0]}
        </Avatar.Fallback>
      </Avatar>
      <p className="flex flex-col">
        {user.firstName} {user.lastName}{" "}
        <span className="text-sm text-slate-600">({user.username})</span>
      </p>
      <div className="flex gap-2 ml-auto">
        {actions.map((action) => (
          <Button
            key={action.label}
            onPress={action.onClick}
            variant={action.variant}
            isIconOnly
            aria-label={action.label}
          >
            {action.icon}
          </Button>
        ))}
      </div>
    </div>
  );
}
