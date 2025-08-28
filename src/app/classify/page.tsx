"use client"

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { MainLayout } from '@/components/main-layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Wand2, Lightbulb } from "lucide-react";
import { datasetClassification, type DatasetClassificationOutput } from "@/ai/flows/dataset-classification";
import { Badge } from "@/components/ui/badge";

const formSchema = z.object({
  sampleRecords: z.string().min(100, "Please provide at least 100 characters of sample records."),
  newDatasetDescription: z.string().min(50, "Please provide at least 50 characters for the dataset description."),
});


export default function ClassifyPage() {
    const [isLoading, setIsLoading] = useState(false);
    const [result, setResult] = useState<DatasetClassificationOutput | null>(null);
    const { toast } = useToast();

    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            sampleRecords: "",
            newDatasetDescription: "",
        },
    });

    async function onSubmit(values: z.infer<typeof formSchema>) {
        setIsLoading(true);
        setResult(null);
        try {
            const classificationResult = await datasetClassification(values);
            setResult(classificationResult);
        } catch (error) {
            console.error("Dataset classification failed:", error);
            toast({
                variant: "destructive",
                title: "Classification Failed",
                description: "An error occurred while suggesting classes. Please try again.",
            });
        } finally {
            setIsLoading(false);
        }
    }

  return (
    <MainLayout pageTitle="Dataset Auto-Classification">
        <Card>
            <CardHeader>
                <CardTitle>Suggest Dataset Classes</CardTitle>
                <CardDescription>
                    Provide sample records and a description of a new dataset to get AI-powered class suggestions. This helps in organizing and preparing data for federated learning without revealing sensitive information.
                </CardDescription>
            </CardHeader>
            <CardContent>
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
                        <FormField
                            control={form.control}
                            name="sampleRecords"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Sample Patient Records</FormLabel>
                                    <FormControl>
                                        <Textarea
                                            placeholder="Paste a small, anonymized set of sample records with known classifications. e.g., 'Record 1: { ... clinical data ... }, Class: Fabry Disease; Record 2: { ... }'"
                                            className="min-h-[200px]"
                                            {...field}
                                        />
                                    </FormControl>
                                    <FormDescription>
                                        Provide a few examples from a similar, already classified dataset.
                                    </FormDescription>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                         <FormField
                            control={form.control}
                            name="newDatasetDescription"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>New Dataset Description</FormLabel>
                                    <FormControl>
                                        <Textarea
                                            placeholder="Describe the new, unclassified dataset. e.g., 'This dataset contains genomic and proteomic data from 500 pediatric patients suspected of metabolic disorders.'"
                                            className="min-h-[100px]"
                                            {...field}
                                        />
                                    </FormControl>
                                    <FormDescription>
                                        Describe the nature, source, and contents of the new dataset.
                                    </FormDescription>
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
                        <h3 className="mt-4 text-lg font-semibold">Analyzing Datasets</h3>
                        <p className="mt-2 text-sm text-muted-foreground">
                        The AI is comparing the data structures to suggest relevant classes.
                        </p>
                    </div>
                )}
                
                {result && (
                    <div className="mt-12">
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
                )}
            </CardContent>
        </Card>
    </MainLayout>
  );
}
