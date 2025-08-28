import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"

const analyses = [
  {
    patientId: "P001",
    disease: "Fabry Disease",
    probability: "92.5%",
    status: "Completed",
  },
  {
    patientId: "P002",
    disease: "Wilson's Disease",
    probability: "88.1%",
    status: "Completed",
  },
  {
    patientId: "P003",
    disease: "Gaucher Disease",
    probability: "N/A",
    status: "Processing",
  },
  {
    patientId: "P004",
    disease: "Cystic Fibrosis",
    probability: "95.3%",
    status: "Completed",
  },
  {
    patientId: "P005",
    disease: "Huntington's",
    probability: "N/A",
    status: "Pending",
  },
  {
    patientId: "P006",
    disease: "Pompe Disease",
    probability: "76.8%",
    status: "Completed",
  },
]

export function RecentAnalysis() {
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Patient ID</TableHead>
          <TableHead>Predicted Disease</TableHead>
          <TableHead className="text-right">Probability</TableHead>
          <TableHead className="text-center">Status</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {analyses.map((analysis) => (
          <TableRow key={analysis.patientId}>
            <TableCell className="font-medium">{analysis.patientId}</TableCell>
            <TableCell>{analysis.disease}</TableCell>
            <TableCell className="text-right">{analysis.probability}</TableCell>
            <TableCell className="text-center">
              <Badge
                variant={
                  analysis.status === "Completed"
                    ? "default"
                    : analysis.status === "Processing"
                    ? "secondary"
                    : "outline"
                }
                className={
                  analysis.status === 'Completed'
                    ? 'bg-green-100 text-green-800 border-green-200 dark:bg-green-900/50 dark:text-green-300 dark:border-green-800'
                    : analysis.status === 'Processing'
                    ? 'bg-blue-100 text-blue-800 border-blue-200 dark:bg-blue-900/50 dark:text-blue-300 dark:border-blue-800'
                    : ''
                }
              >
                {analysis.status}
              </Badge>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  )
}
