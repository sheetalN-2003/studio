
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
    patientId: "P007",
    disease: "Krabbe Disease",
    probability: "98.2%",
    status: "Completed",
    isCritical: true,
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
          <TableRow key={analysis.patientId} className={analysis.isCritical ? "bg-red-50/50 dark:bg-red-900/10" : ""}>
            <TableCell className="font-medium">{analysis.patientId}</TableCell>
            <TableCell>{analysis.disease}</TableCell>
            <TableCell className={`text-right font-medium ${analysis.isCritical ? "text-destructive" : ""}`}>{analysis.probability}</TableCell>
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
                    ? analysis.isCritical ? 'bg-red-100 text-red-800 border-red-200' : 'bg-green-100 text-green-800 border-green-200'
                    : analysis.status === 'Processing'
                    ? 'bg-blue-100 text-blue-800 border-blue-200'
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
