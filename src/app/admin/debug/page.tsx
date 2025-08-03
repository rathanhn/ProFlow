'use client';

import React from 'react';
import DashboardLayout from '@/components/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { checkCloudinaryConfig } from '@/lib/cloudinary-config';
import { AlertTriangle, CheckCircle, Info } from 'lucide-react';

export default function AdminDebugPage() {
  const cloudinaryCheck = checkCloudinaryConfig();

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">System Debug</h1>
          <p className="text-muted-foreground">Check system configuration and troubleshoot issues</p>
        </div>

        {/* Cloudinary Configuration */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              {cloudinaryCheck.isValid ? (
                <CheckCircle className="h-5 w-5 text-green-500" />
              ) : (
                <AlertTriangle className="h-5 w-5 text-red-500" />
              )}
              Cloudinary Configuration
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium">Cloud Name:</label>
                <div className="flex items-center gap-2">
                  <code className="text-sm bg-muted px-2 py-1 rounded">
                    {cloudinaryCheck.config.cloudName || 'Not set'}
                  </code>
                  <Badge variant={cloudinaryCheck.config.cloudName ? 'default' : 'destructive'}>
                    {cloudinaryCheck.config.cloudName ? 'Set' : 'Missing'}
                  </Badge>
                </div>
              </div>
              
              <div>
                <label className="text-sm font-medium">API Key:</label>
                <div className="flex items-center gap-2">
                  <code className="text-sm bg-muted px-2 py-1 rounded">
                    {cloudinaryCheck.config.apiKey}
                  </code>
                  <Badge variant={cloudinaryCheck.config.apiKey !== 'Not set' ? 'default' : 'destructive'}>
                    {cloudinaryCheck.config.apiKey !== 'Not set' ? 'Set' : 'Missing'}
                  </Badge>
                </div>
              </div>
            </div>

            {cloudinaryCheck.issues.length > 0 && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                <h4 className="font-medium text-red-800 mb-2">Configuration Issues:</h4>
                <ul className="list-disc list-inside text-sm text-red-700 space-y-1">
                  {cloudinaryCheck.issues.map((issue, index) => (
                    <li key={index}>{issue}</li>
                  ))}
                </ul>
              </div>
            )}

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <div className="flex items-start gap-2">
                <Info className="h-5 w-5 text-blue-500 mt-0.5" />
                <div>
                  <h4 className="font-medium text-blue-800 mb-2">Environment Variables Required:</h4>
                  <ul className="text-sm text-blue-700 space-y-1">
                    <li><code>NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME</code> - Your Cloudinary cloud name</li>
                    <li><code>NEXT_PUBLIC_CLOUDINARY_API_KEY</code> - Your Cloudinary API key</li>
                    <li><code>CLOUDINARY_API_SECRET</code> - Your Cloudinary API secret (server-only)</li>
                  </ul>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Environment Variables */}
        <Card>
          <CardHeader>
            <CardTitle>Environment Variables</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium">NODE_ENV:</span>
                <Badge variant="outline">{process.env.NODE_ENV || 'Not set'}</Badge>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium">NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME:</span>
                <Badge variant={process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME ? 'default' : 'destructive'}>
                  {process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME ? 'Set' : 'Not set'}
                </Badge>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium">NEXT_PUBLIC_CLOUDINARY_API_KEY:</span>
                <Badge variant={process.env.NEXT_PUBLIC_CLOUDINARY_API_KEY ? 'default' : 'destructive'}>
                  {process.env.NEXT_PUBLIC_CLOUDINARY_API_KEY ? 'Set' : 'Not set'}
                </Badge>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Quick Fixes */}
        <Card>
          <CardHeader>
            <CardTitle>Quick Fixes</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <h4 className="font-medium mb-2">For Image Upload Issues:</h4>
                <ul className="text-sm text-muted-foreground space-y-1 list-disc list-inside">
                  <li>Check that all Cloudinary environment variables are set in your .env.local file</li>
                  <li>Restart the development server after adding environment variables</li>
                  <li>Verify your Cloudinary account settings and API credentials</li>
                  <li>The system will use fallback avatars if Cloudinary is not configured</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
