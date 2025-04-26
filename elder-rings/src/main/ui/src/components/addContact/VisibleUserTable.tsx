import { ContactDto } from "@type/openapiTypes";
import { ChangeEvent, useCallback, useMemo, useState } from "react";
import {
  SortDescriptor,
  Table,
  TableBody,
  TableCell,
  TableColumn,
  TableHeader,
  TableRow,
} from "@heroui/table";
import { Pagination } from "@heroui/pagination";
import { Button } from "@heroui/button";
import { User } from "@heroui/user";
import { Input } from "@heroui/input";
import { IconSearch } from "@components/icons/favouriteIcons";
import { apiClient } from "@openapi/zodiosClient";

interface VisibleUserTableProps {
  visibleUsers: ContactDto[];
}

const columns = [
  { name: "name", uid: "name", sortable: true },
  { name: "actions", uid: "actions" },
];

export default function VisibleUserTable({ visibleUsers }: Readonly<VisibleUserTableProps>) {
  const [page, setPage] = useState<number>(1);
  const [filterValue, setFilterValue] = useState<string>("");
  const [rowsPerPage, setRowsPerPage] = useState(5);
  const [sortDescriptor, setSortDescriptor] = useState<SortDescriptor>({
    column: "firstName",
    direction: "ascending",
  });

  const filteredItems = useMemo(() => {
    let filteredUsers = [...visibleUsers];

    if (filterValue) {
      filteredUsers = visibleUsers.filter((user) => {
        const fullName = user.lastName + " " + user.firstName;
        return fullName.toLowerCase().includes(filterValue.toLowerCase());
      });
    }
    return filteredUsers;
  }, [visibleUsers, filterValue]);

  const pages = Math.ceil(visibleUsers.length / rowsPerPage);

  const items = useMemo(() => {
    const start = (page - 1) * rowsPerPage;
    const end = start + rowsPerPage;

    return filteredItems.slice(start, end);
  }, [page, filteredItems, rowsPerPage]);

  const sortedItems = useMemo(() => {
    return [...items].sort((a, b) => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const first = a[sortDescriptor.column] as any;
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const second = b[sortDescriptor.column] as any;
      const cmp = first < second ? -1 : first > second ? 1 : 0;

      return sortDescriptor.direction === "descending" ? -cmp : cmp;
    });
  }, [sortDescriptor, items]);

  const addUser = (id: string) => {
    apiClient.createContactRequest(undefined, { queries: { targetId: id } });
  };

  const renderCell = useCallback((user: ContactDto, columnKey: string | number) => {
    const cellValue = user[columnKey];

    switch (columnKey) {
      case "name":
        return (
          <User
            avatarProps={{
              radius: "lg",
              src: `data:image/*;base64,${user.picture}`,

              classNames: { base: "w-40 h-40" },
            }}
            description={user.firstName + " " + user.lastName}
            name={user.firstName + " " + user.lastName}
          />
        );
      case "actions":
        return (
          <div className="relative flex justify-end items-center gap-2">
            <Button onPress={() => user.id && addUser(user.id)}>Ajouter aux contacts</Button>
          </div>
        );
      default:
        return cellValue;
    }
  }, []);

  const onNextPage = useCallback(() => {
    if (page < pages) {
      setPage(page + 1);
    }
  }, [page, pages]);

  const onPreviousPage = useCallback(() => {
    if (page > 1) {
      setPage(page - 1);
    }
  }, [page]);

  const onRowsPerPageChange = useCallback((e: ChangeEvent<HTMLSelectElement>) => {
    setRowsPerPage(Number(e.target.value));
    setPage(1);
  }, []);

  const onSearchChange = useCallback((e: ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    if (value) {
      setFilterValue(value);
      setPage(1);
    } else {
      setFilterValue("");
    }
  }, []);

  const onClear = useCallback(() => {
    setFilterValue("");
    setPage(1);
  }, []);

  const topContent = useMemo(() => {
    return (
      <div className="flex flex-col gap-4">
        <div className="flex justify-between items-center">
          <Input
            isClearable
            className="w-full sm:max-w-[50vw]"
            placeholder="Search by name..."
            startContent={<IconSearch />}
            value={filterValue}
            onClear={() => onClear()}
            onChange={onSearchChange}
          />
          <label className="flex items-center text-default-400 text-small">
            Rows per page:
            <select
              className="bg-transparent outline-none text-default-400 text-small"
              onChange={onRowsPerPageChange}
            >
              <option value="5">5</option>
              <option value="10">10</option>
              <option value="20">20</option>
              <option value="50">50</option>
            </select>
          </label>
        </div>
      </div>
    );
  }, [filterValue, onSearchChange, onRowsPerPageChange, onClear]);

  const bottomContent = useMemo(() => {
    return (
      <div className="py-2 px-2 flex justify-between items-center">
        <span className="text-default-400 text-small">Total {visibleUsers.length} users</span>
        <Pagination
          isCompact
          showControls
          showShadow
          color="primary"
          page={page}
          total={pages}
          onChange={setPage}
        />
        <div className="hidden sm:flex justify-end gap-2 ">
          <Button isDisabled={pages === 1} size="sm" variant="flat" onPress={onPreviousPage}>
            Previous
          </Button>
          <Button isDisabled={pages === 1} size="sm" variant="flat" onPress={onNextPage}>
            Next
          </Button>
        </div>
      </div>
    );
  }, [onNextPage, onPreviousPage, page, pages, visibleUsers.length]);

  return (
    <div className="m-8">
      <Table
        isHeaderSticky
        aria-label="Table displaying users you can add as contacts"
        bottomContent={bottomContent}
        bottomContentPlacement="outside"
        classNames={{
          wrapper: "",
        }}
        sortDescriptor={sortDescriptor}
        topContent={topContent}
        topContentPlacement="outside"
        onSortChange={setSortDescriptor}
      >
        <TableHeader columns={columns}>
          {(column) => (
            <TableColumn
              key={column.uid}
              align={column.uid === "actions" ? "center" : "start"}
              allowsSorting={column.sortable}
            >
              {column.name}
            </TableColumn>
          )}
        </TableHeader>
        <TableBody emptyContent={"No users found"} items={sortedItems}>
          {(item) => (
            <TableRow key={item.id}>
              {(columnKey: string | number) => <TableCell>{renderCell(item, columnKey)}</TableCell>}
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  );
}
