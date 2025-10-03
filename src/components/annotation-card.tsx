
"use client";

import { useState, type FormEvent } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useAuth } from '@/context/auth-context';
import { Send, MessageSquare } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { ScrollArea } from './ui/scroll-area';

interface Annotation {
    id: number;
    user: {
        name: string;
        avatar: string;
    };
    comment: string;
    timestamp: Date;
}

const initialAnnotations: Annotation[] = [
    {
        id: 1,
        user: { name: 'Dr. Zhang', avatar: 'https://picsum.photos/101' },
        comment: "This GALC gene variant is highly pathogenic. This strongly supports the Krabbe diagnosis, but we should confirm with enzyme activity levels.",
        timestamp: new Date(Date.now() - 1000 * 60 * 15), // 15 mins ago
    },
    {
        id: 2,
        user: { name: 'Dr. Patel', avatar: 'https://picsum.photos/seed/patel/100' },
        comment: "Agreed. I've flagged this case for urgent enzymatic assay. The rapid neurodegeneration is consistent with early-infantile Krabbe disease.",
        timestamp: new Date(Date.now() - 1000 * 60 * 5), // 5 mins ago
    },
];

const genomicSnippet = `
Gene: GALC (Galactosylceramidase)
Variant: c.859C>T (p.Arg287*)
Classification: Pathogenic
Zygosity: Homozygous
Interpretation: This nonsense variant leads to a premature stop codon, resulting in a truncated, non-functional protein. It is a known cause of Krabbe disease.
`;

export function AnnotationCard() {
    const { user } = useAuth();
    const [annotations, setAnnotations] = useState<Annotation[]>(initialAnnotations);
    const [newComment, setNewComment] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleSubmit = (e: FormEvent) => {
        e.preventDefault();
        if (!newComment.trim() || !user) return;

        setIsSubmitting(true);
        // Simulate API call
        setTimeout(() => {
            const newAnnotation: Annotation = {
                id: annotations.length + 1,
                user: {
                    name: user.name,
                    avatar: user.avatar || '',
                },
                comment: newComment,
                timestamp: new Date(),
            };
            setAnnotations(prev => [...prev, newAnnotation]);
            setNewComment('');
            setIsSubmitting(false);
        }, 500);
    };

    return (
        <Card>
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <MessageSquare className="h-5 w-5" />
                    Collaborative Annotation
                </CardTitle>
                <CardDescription>Review and comment on patient data in real-time.</CardDescription>
            </CardHeader>
            <CardContent>
                <div className="rounded-lg bg-muted p-4 font-mono text-xs">
                    <h4 className="font-sans font-semibold text-sm mb-2">Genomic Report Snippet:</h4>
                    <pre className="whitespace-pre-wrap">{genomicSnippet}</pre>
                </div>

                <div className="mt-6 space-y-6">
                     <h4 className="font-semibold">Discussion</h4>
                     <ScrollArea className="h-48 pr-4">
                        <div className="space-y-6">
                        {annotations.map(annotation => (
                            <div key={annotation.id} className="flex items-start gap-3">
                                <Avatar>
                                    <AvatarImage src={annotation.user.avatar} data-ai-hint="person" />
                                    <AvatarFallback>{annotation.user.name.charAt(0)}</AvatarFallback>
                                </Avatar>
                                <div>
                                    <div className="flex items-center gap-2">
                                        <p className="font-semibold text-sm">{annotation.user.name}</p>
                                        <p className="text-xs text-muted-foreground">
                                            {formatDistanceToNow(annotation.timestamp, { addSuffix: true })}
                                        </p>
                                    </div>
                                    <p className="text-sm text-muted-foreground mt-1">{annotation.comment}</p>
                                </div>
                            </div>
                        ))}
                        </div>
                    </ScrollArea>
                </div>

                 <form onSubmit={handleSubmit} className="mt-6 flex items-start gap-3">
                    {user && (
                         <Avatar>
                            <AvatarImage src={user.avatar} data-ai-hint="person" />
                            <AvatarFallback>{user.name.charAt(0)}</AvatarFallback>
                        </Avatar>
                    )}
                    <div className="flex-1 space-y-2">
                         <Textarea
                            placeholder="Add your annotation..."
                            value={newComment}
                            onChange={(e) => setNewComment(e.target.value)}
                            disabled={isSubmitting}
                        />
                        <div className="flex justify-end">
                            <Button type="submit" size="sm" disabled={isSubmitting || !newComment.trim()}>
                                <Send className="mr-2 h-4 w-4" />
                                {isSubmitting ? 'Submitting...' : 'Submit'}
                            </Button>
                        </div>
                    </div>
                </form>
            </CardContent>
        </Card>
    );
}

