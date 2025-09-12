
"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Loader2, Upload, FileText, Siren } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { diseasePrediction, type DiseasePredictionOutput, type DiseasePredictionInput } from "@/ai/flows/disease-prediction";
import { fileToDataUri } from "@/lib/file-utils";
import { PredictionResults } from "./prediction-results";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";

const formSchema = z.object({
  patientName: z.string().optional(),
  patientId: z.string().optional(),
  patientAge: z.coerce.number().positive().optional(),
  patientHistory: z.string().min(1, {
    message: "Patient history or clinical notes cannot be empty.",
  }).min(50, {
    message: "Patient history must be at least 50 characters for a standard analysis.",
  }).optional(),
  genomicData: z.any().optional(),
  imagingData: z.any().optional(),
  proteomicsData: z.any().optional(),
  emergencyNotes: z.string().optional(),
  emergencyFile: z.any().optional(),
}).refine(data => {
    const isStandardMode = !data.emergencyNotes;
    if (isStandardMode) {
        const hasFiles = data.genomicData?.length > 0 || data.imagingData?.length > 0 || data.proteomicsData?.length > 0;
        const hasHistory = (data.patientHistory?.length ?? 0) >= 50;
        return hasFiles || hasHistory;
    }
    return true; // Emergency mode has different validation
}, {
    message: "For standard analysis, please upload at least one data file or provide a detailed patient history (min. 50 characters).",
    path: ["patientHistory"],
}).refine(data => {
    const isEmergencyMode = !!data.emergencyNotes;
     if(isEmergencyMode) {
        return (data.emergencyNotes?.length ?? 0) > 0;
     }
     return true;
}, {
    message: "Urgent clinical notes are required for Emergency Mode.",
    path: ["emergencyNotes"],
});

const defaultFormValues = {
    patientHistory: "",
    patientName: "",
    patientId: "",
    patientAge: undefined,
    genomicData: undefined,
    imagingData: undefined,
    proteomicsData: undefined,
    emergencyNotes: "",
    emergencyFile: undefined,
};

export function PredictionForm() {
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<DiseasePredictionOutput | null>(null);
  const [patientDataForShap, setPatientDataForShap] = useState<any>(null);
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState("files");


  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: defaultFormValues,
  });
  
  const genomicFileRef = form.register("genomicData");
  const imagingFileRef = form.register("imagingData");
  const proteomicsFileRef = form.register("proteomicsData");
  const emergencyFileRef = form.register("emergencyFile");

  const handleReset = () => {
      setResult(null);
      setPatientDataForShap(null);
      form.reset(defaultFormValues);
  }

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setIsLoading(true);
    setResult(null);
    setPatientDataForShap(null);
    
    try {
        const patientData: any = { 
          patientHistory: values.patientHistory,
          patientName: values.patientName,
          patientId: values.patientId,
          patientAge: values.patientAge,
        };

        const isEmergency = activeTab === 'emergency';
        let input: DiseasePredictionInput;

        if (isEmergency) {
             let emergencyFileUri;
             if (values.emergencyFile?.[0]) {
                const emergencyFile = values.emergencyFile[0];
                emergencyFileUri = await fileToDataUri(emergencyFile);
                patientData.genomicDataFileName = emergencyFile.name; // Assume it's genomic for SHAP
             }
             const history = `
                EMERGENCY FAST-TRACK ANALYSIS
                Patient Name: ${values.patientName || 'N/A'}
                Patient ID: ${values.patientId || 'N/A'}
                Patient Age: ${values.patientAge || 'N/A'}

                Urgent Clinical Notes & Vitals:
                ${values.emergencyNotes}
             `;
             patientData.patientHistory = values.emergencyNotes;
             input = {
                patientHistory: history,
                genomicDataUri: emergencyFileUri,
                isEmergency: true,
             }

        } else {
            let genomicDataUri, imagingDataUri, proteomicsDataUri;
            if (values.genomicData?.[0]) {
                const genomicDataFile = values.genomicData[0];
                genomicDataUri = await fileToDataUri(genomicDataFile);
                patientData.genomicDataFileName = genomicDataFile.name;
            }
            if (values.imagingData?.[0]) {
                const imagingDataFile = values.imagingData[0];
                imagingDataUri = await fileToDataUri(imagingDataFile);
                patientData.imagingDataFileName = imagingDataFile.name;
            }
            if (values.proteomicsData?.[0]) {
                const proteomicsDataFile = values.proteomicsData[0];
                proteomicsDataUri = await fileToDataUri(proteomicsDataFile);
                patientData.proteomicsDataFileName = proteomicsDataFile.name;
            }

            const history = `
                Patient Name: ${values.patientName || 'N/A'}
                Patient ID: ${values.patientId || 'N_A'}
                Patient Age: ${values.patientAge || 'N/A'}

                Clinical History & Symptoms:
                ${values.patientHistory}
            `;
            
            input = {
                genomicDataUri,
                imagingDataUri,
                proteomicsDataUri,
                patientHistory: history,
            };
        }

      const predictionResult = await diseasePrediction(input);
      setResult(predictionResult);
      setPatientDataForShap(patientData);

    } catch (error) {
      console.error("Prediction failed:", error);
      toast({
        variant: "destructive",
        title: "Prediction Failed",
        description: "An error occurred while running the analysis. Please try again.",
      });
    } finally {
      setIsLoading(false);
    }
  }

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center rounded-lg border border-dashed p-12 text-center">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
        <h3 className="mt-4 text-lg font-semibold">Analysis in Progress</h3>
        <p className="mt-2 text-sm text-muted-foreground">
          The AI is analyzing the provided data. This may take a moment.
        </p>
      </div>
    );
  }

  if (result) {
    return <PredictionResults result={result} patientData={patientDataForShap} onReset={handleReset} />;
  }

  return (
    <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
            <Tabs onValueChange={setActiveTab} value={activeTab} className="w-full">
                <TabsList className="grid w-full grid-cols-3">
                    <TabsTrigger value="files">
                        <Upload className="mr-2 h-4 w-4" /> Multi-Modal Files
                    </TabsTrigger>
                    <TabsTrigger value="manual">
                        <FileText className="mr-2 h-4 w-4" /> Manual EHR Input
                    </TabsTrigger>
                     <TabsTrigger value="emergency" className="text-destructive focus:text-destructive data-[state=active]:text-destructive data-[state=active]:border-destructive">
                        <Siren className="mr-2 h-4 w-4" /> Emergency Mode
                    </TabsTrigger>
                </TabsList>
                <TabsContent value="files">
                    <Card>
                        <CardHeader>
                             <CardTitle className="text-lg">Standard Analysis</CardTitle>
                             <CardDescription>Upload genomic, imaging, and/or proteomics data for the highest accuracy predictions.</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-4">
                                <FormField
                                control={form.control}
                                name="genomicData"
                                render={({ field }) => (
                                    <FormItem>
                                    <FormLabel>Genomic Data (e.g. VCF, FASTQ)</FormLabel>
                                    <FormControl>
                                        <div className="relative">
                                            <Upload className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                                            <Input type="file" className="pl-10" {...genomicFileRef} />
                                        </div>
                                    </FormControl>
                                    <FormMessage />
                                    </FormItem>
                                )}
                                />
                                <FormField
                                control={form.control}
                                name="imagingData"
                                render={({ field }) => (
                                    <FormItem>
                                    <FormLabel>Imaging Data (e.g., MRI, DICOM)</FormLabel>
                                    <FormControl>
                                        <div className="relative">
                                            <Upload className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                                            <Input type="file" className="pl-10" {...imagingFileRef} />
                                        </div>
                                    </FormControl>
                                    <FormMessage />
                                    </FormItem>
                                )}
                                />
                                <FormField
                                control={form.control}
                                name="proteomicsData"
                                render={({ field }) => (
                                    <FormItem>
                                    <FormLabel>Proteomics Data (e.g. CSV, mzML)</FormLabel>
                                    <FormControl>
                                        <div className="relative">
                                            <Upload className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                                            <Input type="file" className="pl-10" {...proteomicsFileRef} />
                                        </div>
                                    </FormControl>
                                    <FormMessage />
                                    </FormItem>
                                )}
                                />
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>
                <TabsContent value="manual">
                     <Card>
                        <CardHeader>
                            <CardTitle className="text-lg">Manual Data Entry</CardTitle>
                            <CardDescription>Use this if you are copying and pasting directly from an Electronic Health Record (EHR) system.</CardDescription>
                        </CardHeader>
                        <CardContent>
                           <FormField
                            control={form.control}
                            name="patientHistory"
                            render={({ field }) => (
                                <FormItem>
                                <FormLabel>Patient History & Symptoms (EHR)</FormLabel>
                                <FormControl>
                                    <Textarea
                                    placeholder="Provide a detailed summary of the patient's clinical history, symptoms, and any previous findings..."
                                    className="min-h-[350px]"
                                    {...field}
                                    />
                                </FormControl>
                                <FormMessage />
                                </FormItem>
                            )}
                            />
                        </CardContent>
                    </Card>
                </TabsContent>
                 <TabsContent value="emergency">
                     <Card className="border-destructive">
                        <CardHeader>
                            <CardTitle className="text-lg text-destructive">Emergency Fast-Track</CardTitle>
                            <CardDescription>Optimized for speed in critical situations. Provides a rapid, preliminary analysis based on minimal data.</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                           <FormField
                            control={form.control}
                            name="emergencyNotes"
                            render={({ field }) => (
                                <FormItem>
                                <FormLabel>Urgent Clinical Notes & Vitals</FormLabel>
                                <FormControl>
                                    <Textarea
                                    placeholder="Enter critical information here. E.g., 'Patient, 3-day-old male, presenting with seizures, hypotonia, and metabolic acidosis. Key lab: Lactate 15 mmol/L.'"
                                    className="min-h-[150px]"
                                    {...field}
                                    />
                                </FormControl>
                                <FormMessage />
                                </FormItem>
                            )}
                            />
                             <FormField
                                control={form.control}
                                name="emergencyFile"
                                render={({ field }) => (
                                    <FormItem>
                                    <FormLabel>Critical File (Optional)</FormLabel>
                                    <FormControl>
                                        <div className="relative">
                                            <Upload className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                                            <Input type="file" className="pl-10" {...emergencyFileRef} />
                                        </div>
                                    </FormControl>
                                    <FormMessage />
                                    </FormItem>
                                )}
                                />
                        </CardContent>
                    </Card>
                </TabsContent>
            </Tabs>
            
            <Card>
                <CardHeader>
                    <CardTitle className="text-lg">Patient Information</CardTitle>
                    <CardDescription>This information will be included with the analysis report.</CardDescription>
                </CardHeader>
                <CardContent>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <FormField
                            control={form.control}
                            name="patientName"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Patient Name</FormLabel>
                                    <FormControl><Input placeholder="John Doe" {...field} /></FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                            <FormField
                            control={form.control}
                            name="patientId"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Patient ID</FormLabel>
                                    <FormControl><Input placeholder="HSP-12345" {...field} /></FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <FormField
                            control={form.control}
                            name="patientAge"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Age</FormLabel>
                                    <FormControl><Input type="number" placeholder="42" {...field} value={field.value ?? ''} onChange={event => field.onChange(event.target.value === '' ? undefined : +event.target.value)} /></FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                    </div>
                     {activeTab === "files" && (
                        <FormField
                            control={form.control}
                            name="patientHistory"
                            render={({ field }) => (
                                <FormItem className="mt-4">
                                <FormLabel>
                                    Additional Notes & Patient History
                                </FormLabel>
                                <FormControl>
                                    <Textarea
                                    placeholder="Provide any additional context or summary of the patient's clinical history, symptoms, and findings..."
                                    className="min-h-[150px]"
                                    {...field}
                                    />
                                </FormControl>
                                <FormMessage />
                                </FormItem>
                            )}
                        />
                     )}
                </CardContent>
            </Card>
            
            <Button type="submit" disabled={isLoading} size="lg" variant={activeTab === 'emergency' ? 'destructive' : 'default'}>
                {isLoading ? (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : null}
                Run Prediction
            </Button>
      </form>
    </Form>
  );
}

    