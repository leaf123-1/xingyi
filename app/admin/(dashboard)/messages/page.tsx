import { prisma } from "@/lib/prisma";
import { MessagesManager } from "@/components/admin/messages-manager";

export default async function AdminMessagesPage() {
  const messages = await prisma.contactMessage.findMany({
    orderBy: { createdAt: "desc" },
    take: 50,
  });
  const formatted = messages.map((message) => ({
    id: message.id,
    name: message.name,
    email: message.email,
    phone: message.phone,
    message: message.message,
    sourcePath: message.sourcePath,
    status: message.status,
    createdAt: message.createdAt.toISOString(),
  }));
  return <MessagesManager messages={formatted} />;
}
