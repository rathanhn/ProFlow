'use client';

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Star, Send, MessageSquare } from 'lucide-react';
import { useToast } from '@/components/ui/toast-system';
import { addFeedback } from '@/lib/firebase-service';
import { FeedbackType, FeedbackPriority, UserType } from '@/lib/types';

interface FeedbackFormProps {
  userType: UserType;
  userId?: string;
  userName?: string;
  onSubmitSuccess?: () => void;
}

export const FeedbackForm: React.FC<FeedbackFormProps> = ({
  userType,
  userId,
  userName = 'Anonymous User',
  onSubmitSuccess
}) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    type: 'improvement' as FeedbackType,
    title: '',
    description: '',
    priority: 'medium' as FeedbackPriority,
    category: '',
    rating: 0
  });

  const { showToast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.title || !formData.description) {
      showToast({
        type: 'warning',
        message: 'Please fill in all required fields',
        style: 'modern'
      });
      return;
    }

    setIsSubmitting(true);

    try {
      const feedbackData = {
        type: formData.type,
        title: formData.title,
        description: formData.description,
        status: 'pending' as any,
        priority: formData.priority,
        submittedBy: userName,
        submittedAt: new Date().toISOString(),
        userType,
        category: formData.category || 'General Feedback',
        rating: formData.rating > 0 ? formData.rating : undefined,
        ...(userType === 'client' && userId && { clientId: userId }),
        ...(userType === 'creator' && userId && { creatorId: userId })
      };

      await addFeedback(feedbackData);

      showToast({
        type: 'success',
        title: 'Feedback Submitted',
        message: 'Thank you for your feedback! We appreciate your input.',
        style: 'modern'
      });

      // Reset form
      setFormData({
        type: 'improvement',
        title: '',
        description: '',
        priority: 'medium',
        category: '',
        rating: 0
      });

      onSubmitSuccess?.();
    } catch (error) {
      console.error('Error submitting feedback:', error);
      showToast({
        type: 'error',
        message: 'Failed to submit feedback. Please try again.',
        style: 'modern'
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleRatingClick = (rating: number) => {
    setFormData(prev => ({ ...prev, rating }));
  };

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <MessageSquare className="h-5 w-5" />
          Submit Feedback
        </CardTitle>
        <CardDescription>
          Help us improve by sharing your thoughts, suggestions, or reporting issues.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Feedback Type */}
          <div className="space-y-2">
            <Label htmlFor="type">Feedback Type *</Label>
            <Select value={formData.type} onValueChange={(value) => setFormData(prev => ({ ...prev, type: value as FeedbackType }))}>
              <SelectTrigger>
                <SelectValue placeholder="Select feedback type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="bug">🐛 Bug Report</SelectItem>
                <SelectItem value="feature">✨ Feature Request</SelectItem>
                <SelectItem value="improvement">🔧 Improvement</SelectItem>
                <SelectItem value="complaint">😞 Complaint</SelectItem>
                <SelectItem value="praise">👏 Praise</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Title */}
          <div className="space-y-2">
            <Label htmlFor="title">Title *</Label>
            <Input
              id="title"
              value={formData.title}
              onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
              placeholder="Brief summary of your feedback"
              required
            />
          </div>

          {/* Description */}
          <div className="space-y-2">
            <Label htmlFor="description">Description *</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
              placeholder="Provide detailed information about your feedback"
              rows={4}
              required
            />
          </div>

          {/* Category */}
          <div className="space-y-2">
            <Label htmlFor="category">Category</Label>
            <Input
              id="category"
              value={formData.category}
              onChange={(e) => setFormData(prev => ({ ...prev, category: e.target.value }))}
              placeholder="e.g., UI/UX, Performance, Feature"
            />
          </div>

          {/* Priority */}
          <div className="space-y-2">
            <Label htmlFor="priority">Priority</Label>
            <Select value={formData.priority} onValueChange={(value) => setFormData(prev => ({ ...prev, priority: value as FeedbackPriority }))}>
              <SelectTrigger>
                <SelectValue placeholder="Select priority" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="low">Low</SelectItem>
                <SelectItem value="medium">Medium</SelectItem>
                <SelectItem value="high">High</SelectItem>
                <SelectItem value="critical">Critical</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Rating */}
          <div className="space-y-2">
            <Label>Overall Satisfaction (Optional)</Label>
            <div className="flex gap-1">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  onClick={() => handleRatingClick(star)}
                  className="p-1 hover:scale-110 transition-transform"
                >
                  <Star
                    className={`h-6 w-6 ${
                      star <= formData.rating
                        ? 'fill-yellow-400 text-yellow-400'
                        : 'text-gray-300'
                    }`}
                  />
                </button>
              ))}
            </div>
            {formData.rating > 0 && (
              <p className="text-sm text-muted-foreground">
                You rated: {formData.rating} star{formData.rating !== 1 ? 's' : ''}
              </p>
            )}
          </div>

          {/* Submit Button */}
          <Button
            type="submit"
            disabled={isSubmitting}
            className="w-full"
          >
            {isSubmitting ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                Submitting...
              </>
            ) : (
              <>
                <Send className="h-4 w-4 mr-2" />
                Submit Feedback
              </>
            )}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
};

export default FeedbackForm;
