"use client"

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { MainLayout } from '@/components/main-layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Wand2, Lightbulb, Upload } from "lucide-react";
import { classifyDatasetFromFile, type ClassifyDatasetFromFileOutput } from "@/ai/flows/classify-dataset-from-file";
import { fileToDataUri } from "@/lib/file-utils";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";

const formSchema = z.object({
  datasetFile: z.any().refine(file => file?.length == 1, "A dataset file (CSV or Excel) is required."),
});


export default function ClassifyPage() {
    const [isLoading, setIsLoading] = useState(false);
    const [result, setResult] = useState<ClassifyDatasetFromFileOutput | null>(null);
    const { toast } = useToast();

    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
    });
    
    const fileRef = form.register("datasetFile");

    async function onSubmit(values: z.infer<typeof formSchema>) {
        setIsLoading(true);
        setResult(null);
        try {
            const file = values.datasetFile[0];
            const dataUri = await fileToDataUri(file);

            const classificationResult = await classifyDatasetFromFile({
                datasetDataUri: dataUri,
                fileName: file.name,
            });
            setResult(classificationResult);
        } catch (error) {
            console.error("Dataset classification failed:", error);
            toast({
                variant: "destructive",
                title: "Classification Failed",
                description: "An error occurred while suggesting classes. Please ensure the file is a valid CSV or Excel file.",
            });
        } finally {
            setIsLoading(false);
        }
    }

  return (
    <MainLayout pageTitle="Dataset Auto-Classification">
        <Card>
            <CardHeader>
                <CardTitle>Suggest Dataset Classes from File</CardTitle>
                <CardDescription>
                    Upload a CSV or Excel file containing patient data to get AI-powered class suggestions. This helps in organizing and preparing data for federated learning.
                </CardDescription>
            </CardHeader>
            <CardContent>
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
                        <FormField
                            control={form.control}
                            name="datasetFile"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Dataset File</FormLabel>
                                    <FormControl>
                                        <div className="relative">
                                            <Upload className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                                            <Input type="file" className="pl-10" accept=".csv, application/vnd.openxmlformats-officedocument.spreadsheetml.sheet, application/vnd.ms-excel" {...fileRef} />
                                        </div>
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <Button type="submit" disabled={isLoading} size="lg">
                            {isLoading ? (
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            ) : (
                                <Wand2 className="mr-2 h-4 w-4" />
                            )}
                            Suggest Classes
                        </Button>
                    </form>
                </Form>

                {isLoading && (
                     <div className="mt-12 flex flex-col items-center justify-center rounded-lg border border-dashed p-12 text-center">
                        <Loader2 className="h-12 w-12 animate-spin text-primary" />
                        <h3 className="mt-4 text-lg font-semibold">Analyzing Dataset</h3>
                        <p className="mt-2 text-sm text-muted-foreground">
                        The AI is analyzing the file contents to suggest relevant classes.
                        </p>
                    </div>
                )}
                
                {result && (
                    <div className="mt-12 space-y-6">
                        <div>
                            <h3 className="text-lg font-semibold flex items-center mb-4">
                               <Lightbulb className="h-5 w-5 mr-2 text-primary"/>
                               Suggested Classes
                            </h3>
                            <div className="flex flex-wrap gap-2">
                                {result.suggestedClasses.map((label, index) => (
                                    <Badge key={index} variant="secondary" className="text-base px-4 py-2">
                                        {label}
                                    </Badge>
                                ))}
                            </div>
                        </div>
                         <div>
                            <h3 className="text-lg font-semibold flex items-center mb-2">
                               Analysis Summary
                            </h3>
                            <p className="text-sm text-muted-foreground">{result.analysisSummary}</p>
                        </div>
                    </div>
                )}
            </CardContent>
        </Card>
    </MainLayout>
  );
}
