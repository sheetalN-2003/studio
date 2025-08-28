"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Loader2, Upload, FileText } from "lucide-react";
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
import { diseasePrediction, type DiseasePredictionOutput } from "@/ai/flows/disease-prediction";
import { fileToDataUri } from "@/lib/file-utils";
import { PredictionResults } from "./prediction-results";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent } from "./ui/card";

const formSchema = z.object({
  patientHistory: z.string().min(50, {
    message: "Patient history must be at least 50 characters.",
  }),
  genomicData: z.any().optional(),
  imagingData: z.any().optional(),
}).refine(data => {
    const hasFiles = data.genomicData?.length > 0 && data.imagingData?.length > 0;
    const hasHistory = data.patientHistory.length >= 50;
    // We need either both files or a sufficient patient history
    return hasFiles || hasHistory;
}, {
    message: "Please either upload both genomic and imaging data files, or provide a detailed patient history.",
    path: ["patientHistory"], // You can decide where to show this error
});


export function PredictionForm() {
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<DiseasePredictionOutput | null>(null);
  const [patientDataForShap, setPatientDataForShap] = useState<any>(null);
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState("files");


  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      patientHistory: "",
    },
  });
  
  const genomicFileRef = form.register("genomicData");
  const imagingFileRef = form.register("imagingData");

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setIsLoading(true);
    setResult(null);
    setPatientDataForShap(null);
    
    try {
        let genomicDataUri, imagingDataUri;
        const patientData: any = { patientHistory: values.patientHistory };

        if (activeTab === "files" && values.genomicData?.[0] && values.imagingData?.[0]) {
            const genomicDataFile = values.genomicData[0];
            const imagingDataFile = values.imagingData[0];

            [genomicDataUri, imagingDataUri] = await Promise.all([
                fileToDataUri(genomicDataFile),
                fileToDataUri(imagingDataFile),
            ]);
            patientData.genomicDataFileName = genomicDataFile.name;
            patientData.imagingDataFileName = imagingDataFile.name;
        }
      
      const input = {
          genomicDataUri,
          imagingDataUri,
          patientHistory: values.patientHistory,
      };

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
    return <PredictionResults result={result} patientData={patientDataForShap} onReset={() => { setResult(null); form.reset(); }} />;
  }

  return (
    <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
            <Tabs onValueChange={setActiveTab} value={activeTab} className="w-full">
                <TabsList className="grid w-full grid-cols-2">
                    <TabsTrigger value="files">
                        <Upload className="mr-2" /> Multi-Modal Files
                    </TabsTrigger>
                    <TabsTrigger value="manual">
                        <FileText className="mr-2" /> Manual EHR Input
                    </TabsTrigger>
                </TabsList>
                <TabsContent value="files">
                    <Card>
                        <CardContent className="pt-6">
                            <div className="space-y-4">
                               <p className="text-sm text-muted-foreground">Upload both genomic and imaging data for the highest accuracy predictions.</p>
                                <FormField
                                control={form.control}
                                name="genomicData"
                                render={({ field }) => (
                                    <FormItem>
                                    <FormLabel>Genomic Data</FormLabel>
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
                                    <FormLabel>Imaging Data (e.g., MRI)</FormLabel>
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
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>
                <TabsContent value="manual">
                     <Card>
                        <CardContent className="pt-6">
                           <p className="text-sm text-muted-foreground mb-4">
                                If you don&apos;t have data files, provide a detailed patient summary. The model will base its prediction solely on this information.
                            </p>
                           <FormField
                            control={form.control}
                            name="patientHistory"
                            render={({ field }) => (
                                <FormItem>
                                <FormLabel>Patient History & Symptoms (EHR)</FormLabel>
                                <FormControl>
                                    <Textarea
                                    placeholder="Provide a detailed summary of the patient's clinical history, symptoms, and any previous findings..."
                                    className="min-h-[200px]"
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
            </Tabs>

            <FormField
            control={form.control}
            name="patientHistory"
            render={({ field }) => (
                <FormItem>
                <FormLabel>
                    Additional Notes & Patient History {activeTab === "files" ? "(Optional but Recommended)" : ""}
                </FormLabel>
                <FormControl>
                    <Textarea
                    placeholder="Provide a detailed summary of the patient's clinical history, symptoms, and any previous findings..."
                    className="min-h-[150px]"
                    {...field}
                    />
                </FormControl>
                <FormMessage />
                </FormItem>
            )}
            />
            
            <Button type="submit" disabled={isLoading} size="lg">
            {isLoading ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : null}
            Run Prediction
            </Button>
      </form>
    </Form>
  );
}
