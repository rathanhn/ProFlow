'use client';

import React, { useState } from 'react';
import DashboardLayout from '@/components/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ModernPopup, SuccessPopup, ErrorPopup, WarningPopup, InfoPopup, usePopup } from '@/components/ui/modern-popup';
import { ToastProvider, useToast } from '@/components/ui/toast-system';
import { INRIcon, SimpleINRIcon, INRSymbol } from '@/components/ui/inr-icon';
import { 
  Smartphone, 
  Palette, 
  Bell, 
  Zap,
  ArrowLeft,
  ArrowRight,
  SwipeIcon as Swipe
} from 'lucide-react';

function DemoContent() {
  const { showToast } = useToast();
  const { isOpen, openPopup, closePopup, config } = usePopup();
  const [currentDemo, setCurrentDemo] = useState<'swipe' | 'currency' | 'popups'>('swipe');

  const showDemoToast = (type: 'success' | 'error' | 'warning' | 'info', style: 'modern' | 'minimal' | 'glass' | 'android') => {
    showToast({
      type,
      title: `${style.charAt(0).toUpperCase() + style.slice(1)} ${type.charAt(0).toUpperCase() + type.slice(1)}`,
      message: `This is a ${style} style ${type} toast notification with INR support!`,
      style,
      action: {
        label: 'View Details',
        onClick: () => console.log('Toast action clicked'),
      },
    });
  };

  const openDemoPopup = (variant: 'default' | 'success' | 'error' | 'warning' | 'info', style: 'modern' | 'glass' | 'minimal' | 'android' | 'ios') => {
    openPopup({
      variant,
      style,
      title: `${style.charAt(0).toUpperCase() + style.slice(1)} ${variant.charAt(0).toUpperCase() + variant.slice(1)} Popup`,
      size: 'md',
    });
  };

  return (
    <DashboardLayout>
      <div className="space-y-6 fab-safe-bottom">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Feature Demo</h1>
          <p className="text-muted-foreground">
            Showcase of new features: Swipe Navigation, INR Currency Icons, and Modern Popups
          </p>
        </div>

        {/* Feature Navigation */}
        <div className="flex gap-2 overflow-x-auto pb-2">
          <Button
            variant={currentDemo === 'swipe' ? 'default' : 'outline'}
            onClick={() => setCurrentDemo('swipe')}
            className="flex items-center gap-2 whitespace-nowrap"
          >
            <Smartphone className="h-4 w-4" />
            Swipe Navigation
          </Button>
          <Button
            variant={currentDemo === 'currency' ? 'default' : 'outline'}
            onClick={() => setCurrentDemo('currency')}
            className="flex items-center gap-2 whitespace-nowrap"
          >
            <INRIcon className="h-4 w-4" />
            INR Currency
          </Button>
          <Button
            variant={currentDemo === 'popups' ? 'default' : 'outline'}
            onClick={() => setCurrentDemo('popups')}
            className="flex items-center gap-2 whitespace-nowrap"
          >
            <Palette className="h-4 w-4" />
            Modern Popups
          </Button>
        </div>

        {/* Swipe Navigation Demo */}
        {currentDemo === 'swipe' && (
          <div className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Smartphone className="h-5 w-5" />
                  Swipe Navigation
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="bg-gradient-to-r from-blue-50 to-purple-50 p-6 rounded-lg border">
                  <h3 className="font-semibold mb-3">📱 Mobile Tab Swiping</h3>
                  <div className="space-y-2 text-sm text-muted-foreground">
                    <p>• <strong>Touch:</strong> Swipe left/right on mobile tabs to navigate</p>
                    <p>• <strong>Desktop:</strong> Use Ctrl+Arrow keys to switch tabs</p>
                    <p>• <strong>Haptic:</strong> Feel the feedback on supported devices</p>
                    <p>• <strong>Visual:</strong> See swipe indicator during gesture</p>
                  </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="p-4 border rounded-lg">
                    <h4 className="font-medium mb-2">Swipe Gestures</h4>
                    <div className="space-y-2 text-sm">
                      <div className="flex items-center gap-2">
                        <ArrowLeft className="h-4 w-4 text-blue-500" />
                        <span>Swipe Right → Previous Tab</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <ArrowRight className="h-4 w-4 text-blue-500" />
                        <span>Swipe Left → Next Tab</span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="p-4 border rounded-lg">
                    <h4 className="font-medium mb-2">Keyboard Shortcuts</h4>
                    <div className="space-y-2 text-sm">
                      <div className="flex items-center gap-2">
                        <Badge variant="outline">Ctrl + ←</Badge>
                        <span>Previous Tab</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge variant="outline">Ctrl + →</Badge>
                        <span>Next Tab</span>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Currency Icons Demo */}
        {currentDemo === 'currency' && (
          <div className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <INRIcon className="h-5 w-5" />
                  INR Currency Icons
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="p-4 border rounded-lg text-center">
                    <INRIcon className="h-8 w-8 mx-auto mb-2 text-green-600" />
                    <h4 className="font-medium">INR Icon</h4>
                    <p className="text-sm text-muted-foreground">Detailed rupee symbol</p>
                  </div>
                  
                  <div className="p-4 border rounded-lg text-center">
                    <SimpleINRIcon className="h-8 w-8 mx-auto mb-2 text-blue-600" />
                    <h4 className="font-medium">Simple INR</h4>
                    <p className="text-sm text-muted-foreground">Simplified version</p>
                  </div>
                  
                  <div className="p-4 border rounded-lg text-center">
                    <INRSymbol className="h-8 w-8 mx-auto mb-2 text-purple-600" />
                    <h4 className="font-medium">INR Symbol</h4>
                    <p className="text-sm text-muted-foreground">Text-based ₹</p>
                  </div>
                </div>

                <div className="bg-gradient-to-r from-green-50 to-blue-50 p-6 rounded-lg border">
                  <h3 className="font-semibold mb-3">💰 Usage Examples</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-3">
                      <div className="flex items-center gap-3 p-3 bg-white rounded-lg border">
                        <INRIcon className="h-5 w-5 text-green-600" />
                        <div>
                          <p className="font-medium">Total Earnings</p>
                          <p className="text-sm text-muted-foreground">₹2,45,000</p>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-3 p-3 bg-white rounded-lg border">
                        <SimpleINRIcon className="h-5 w-5 text-blue-600" />
                        <div>
                          <p className="font-medium">Outstanding</p>
                          <p className="text-sm text-muted-foreground">₹45,000</p>
                        </div>
                      </div>
                    </div>
                    
                    <div className="space-y-3">
                      <div className="flex items-center gap-3 p-3 bg-white rounded-lg border">
                        <INRSymbol className="h-5 w-5 text-purple-600" />
                        <div>
                          <p className="font-medium">Monthly Revenue</p>
                          <p className="text-sm text-muted-foreground">₹1,20,000</p>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-3 p-3 bg-white rounded-lg border">
                        <INRIcon className="h-5 w-5 text-orange-600" />
                        <div>
                          <p className="font-medium">Project Value</p>
                          <p className="text-sm text-muted-foreground">₹75,000</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Popups Demo */}
        {currentDemo === 'popups' && (
          <div className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Bell className="h-5 w-5" />
                  Toast Notifications
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  {(['modern', 'minimal', 'glass', 'android'] as const).map(style => (
                    <div key={style} className="space-y-2">
                      <h4 className="font-medium capitalize">{style}</h4>
                      <div className="space-y-1">
                        {(['success', 'error', 'warning', 'info'] as const).map(type => (
                          <Button
                            key={type}
                            variant="outline"
                            size="sm"
                            onClick={() => showDemoToast(type, style)}
                            className="w-full text-xs"
                          >
                            {type}
                          </Button>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Zap className="h-5 w-5" />
                  Modern Popups
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-5 gap-3">
                  {(['modern', 'glass', 'minimal', 'android', 'ios'] as const).map(style => (
                    <div key={style} className="space-y-2">
                      <h4 className="font-medium capitalize">{style}</h4>
                      <div className="space-y-1">
                        {(['default', 'success', 'error', 'warning', 'info'] as const).map(variant => (
                          <Button
                            key={variant}
                            variant="outline"
                            size="sm"
                            onClick={() => openDemoPopup(variant, style)}
                            className="w-full text-xs"
                          >
                            {variant}
                          </Button>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Demo Popup */}
        <ModernPopup
          isOpen={isOpen}
          onClose={closePopup}
          title={config.title}
          variant={config.variant}
          style={config.style}
          size={config.size}
        >
          <div className="space-y-4">
            <p>This is a demo of the {config.style} style popup with {config.variant} variant.</p>
            <div className="flex items-center gap-2">
              <INRIcon className="h-4 w-4" />
              <span>Supports INR currency: ₹1,00,000</span>
            </div>
            <div className="flex gap-2">
              <Button onClick={closePopup}>Close</Button>
              <Button variant="outline" onClick={() => showToast({
                type: 'success',
                message: 'Popup action completed!',
                style: 'modern'
              })}>
                Action
              </Button>
            </div>
          </div>
        </ModernPopup>
      </div>
    </DashboardLayout>
  );
}

export default function AdminDemoPage() {
  return (
    <ToastProvider position="top-right">
      <DemoContent />
    </ToastProvider>
  );
}
