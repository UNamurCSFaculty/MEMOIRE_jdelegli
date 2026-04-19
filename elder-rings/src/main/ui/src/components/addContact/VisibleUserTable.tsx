import { ContactDto } from "@type/openapiTypes";
import { useMemo, useState } from "react";
import { Avatar as HeroAvatar, Button, Input, Table } from "@heroui/react";
import { AvatarFallback, AvatarImage } from "@heroui/react/avatar";
import { apiClient } from "@openapi/zodiosClient";

interface VisibleUserTableProps {
  visibleUsers: ContactDto[];
}

const Avatar = Object.assign(HeroAvatar, {
  Image: AvatarImage,
  Fallback: AvatarFallback,
}) as typeof HeroAvatar & {
  Image: typeof AvatarImage;
  Fallback: typeof AvatarFallback;
};

export default function VisibleUserTable({ visibleUsers }: Readonly<VisibleUserTableProps>) {
  const [filterValue, setFilterValue] = useState<string>("");

  const filteredItems = useMemo(() => {
    if (filterValue) {
      return visibleUsers.filter((user) => {
        const fullName = `${user.lastName ?? ""} ${user.firstName ?? ""}`.trim();
        return fullName.toLowerCase().includes(filterValue.toLowerCase());
      });
    }
    return visibleUsers;
  }, [visibleUsers, filterValue]);

  const addUser = (id: string) => {
    apiClient.createContactRequest(undefined, { queries: { targetId: id } });
  };

  const getInitials = (user: ContactDto) => {
    const first = user.firstName?.trim().charAt(0) ?? "";
    const last = user.lastName?.trim().charAt(0) ?? "";
    const initials = `${first}${last}`.toUpperCase();
    return initials || "?";
  };

  const renderNameCell = (user: ContactDto) => {
    const fullName = `${user.firstName ?? ""} ${user.lastName ?? ""}`.trim();

    return (
      <div className="inline-flex items-center gap-3">
        <Avatar className="w-40 h-40">
          {user.picture ? (
            <Avatar.Image src={`data:image/*;base64,${user.picture}`} alt={fullName} />
          ) : null}
          <Avatar.Fallback>{getInitials(user)}</Avatar.Fallback>
        </Avatar>
        <div className="flex flex-col">
          <span className="text-sm font-medium">{fullName}</span>
          <span className="text-xs text-default-500">{user.username ?? fullName}</span>
        </div>
      </div>
    );
  };

  return (
    <div className="m-8 space-y-4">
      <div className="max-w-md">
        <Input
          placeholder="Search by name..."
          value={filterValue}
          onChange={(event) => setFilterValue(event.target.value)}
        />
      </div>
      <Table>
        <Table.ScrollContainer>
          <Table.Content aria-label="Table displaying users you can add as contacts">
            <Table.Header>
              <Table.Column isRowHeader>Name</Table.Column>
              <Table.Column>Actions</Table.Column>
            </Table.Header>
            <Table.Body>
              {filteredItems.length === 0 ? (
                <Table.Row id="empty">
                  <Table.Cell colSpan={2}>No users found</Table.Cell>
                </Table.Row>
              ) : (
                filteredItems.map((user, index) => {
                  const rowId =
                    user.id ??
                    user.username ??
                    `${user.firstName ?? ""}-${user.lastName ?? ""}-${index}`;
                  return (
                    <Table.Row key={rowId} id={rowId}>
                      <Table.Cell>{renderNameCell(user)}</Table.Cell>
                      <Table.Cell>
                        <Button onPress={() => user.id && addUser(user.id)}>
                          Ajouter aux contacts
                        </Button>
                      </Table.Cell>
                    </Table.Row>
                  );
                })
              )}
            </Table.Body>
          </Table.Content>
        </Table.ScrollContainer>
      </Table>
    </div>
  );
}
