import { createElement } from "react";
import { headers } from "next/headers";
import { renderToBuffer } from "@react-pdf/renderer";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { isValidFeedback } from "@/lib/evaluate-interview";
import { ReportDocument } from "./report-document";

export async function GET(
  _req: Request,
  ctx: RouteContext<"/interview/[sessionId]/report">
) {
  const session = await auth.api.getSession({ headers: await headers() });

  if (!session?.user) {
    return new Response("Unauthorized", { status: 401 });
  }

  const { sessionId } = await ctx.params;

  const interviewSession = await prisma.interviewSession.findUnique({
    where: { id: sessionId },
  });

  if (!interviewSession || interviewSession.userId !== session.user.id) {
    return new Response("Not found", { status: 404 });
  }

  if (!isValidFeedback(interviewSession.feedback)) {
    return new Response("No feedback available for this session yet.", { status: 400 });
  }

  const document = createElement(ReportDocument, {
    session: interviewSession,
    feedback: interviewSession.feedback,
  }) as Parameters<typeof renderToBuffer>[0];

  const buffer = await renderToBuffer(document);

  return new Response(new Uint8Array(buffer), {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `attachment; filename="interview-report-${sessionId}.pdf"`,
    },
  });
}
