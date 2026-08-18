import { Document, Page, View, Text, StyleSheet } from "@react-pdf/renderer";
import type { InterviewSession } from "@/generated/prisma/client";
import { PARAMETER_LABELS, type InterviewFeedback } from "@/lib/interview-types";

const styles = StyleSheet.create({
  page: { padding: 40, fontSize: 11, fontFamily: "Helvetica" },
  title: { fontSize: 20, marginBottom: 4 },
  subtitle: { fontSize: 10, color: "#666666", marginBottom: 20 },
  scoreRow: { flexDirection: "row", alignItems: "baseline", marginBottom: 16 },
  scoreValue: { fontSize: 32, marginRight: 6 },
  scoreLabel: { fontSize: 10, color: "#666666" },
  section: { marginBottom: 16 },
  sectionTitle: {
    fontSize: 9,
    textTransform: "uppercase",
    color: "#666666",
    marginBottom: 6,
    letterSpacing: 0.5,
  },
  parameterRow: { flexDirection: "row", justifyContent: "space-between", marginBottom: 4 },
  bullet: { marginBottom: 3 },
  exampleBlock: {
    marginBottom: 8,
    padding: 8,
    border: "1 solid #dddddd",
    borderRadius: 4,
  },
  exampleQuestion: { fontSize: 11, marginBottom: 3 },
  exampleAnswer: { fontSize: 10, color: "#444444" },
});

function formatDate(date: Date): string {
  return date.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}

export function ReportDocument({
  session,
  feedback,
}: {
  session: InterviewSession;
  feedback: InterviewFeedback;
}) {
  return (
    <Document>
      <Page size="A4" style={styles.page}>
        <Text style={styles.title}>{session.interviewType} Interview Report</Text>
        <Text style={styles.subtitle}>
          {session.difficulty} difficulty · {session.numQuestions} questions ·{" "}
          {session.mode} · {formatDate(session.createdAt)}
        </Text>

        <View style={styles.scoreRow}>
          <Text style={styles.scoreValue}>{feedback.overallScore}</Text>
          <Text style={styles.scoreLabel}>/ 100 overall</Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Parameter Breakdown</Text>
          {PARAMETER_LABELS.map(({ key, label }) => (
            <View key={key} style={styles.parameterRow}>
              <Text>{label}</Text>
              <Text>{feedback.parameters[key]}/100</Text>
            </View>
          ))}
        </View>

        {feedback.strengths.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Strengths</Text>
            {feedback.strengths.map((item, i) => (
              <Text key={i} style={styles.bullet}>
                • {item}
              </Text>
            ))}
          </View>
        )}

        {feedback.weaknesses.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Weaknesses</Text>
            {feedback.weaknesses.map((item, i) => (
              <Text key={i} style={styles.bullet}>
                • {item}
              </Text>
            ))}
          </View>
        )}

        {feedback.suggestions.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Suggestions</Text>
            {feedback.suggestions.map((item, i) => (
              <Text key={i} style={styles.bullet}>
                • {item}
              </Text>
            ))}
          </View>
        )}

        {feedback.exampleAnswers && feedback.exampleAnswers.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Example Answers</Text>
            {feedback.exampleAnswers.map((item, i) => (
              <View key={i} style={styles.exampleBlock}>
                <Text style={styles.exampleQuestion}>{item.question}</Text>
                <Text style={styles.exampleAnswer}>{item.modelAnswer}</Text>
              </View>
            ))}
          </View>
        )}
      </Page>
    </Document>
  );
}
