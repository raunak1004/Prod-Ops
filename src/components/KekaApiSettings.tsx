import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Settings, CheckCircle, XCircle, Eye, EyeOff } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { kekaApiService, type KekaOAuthConfig } from "@/services/kekaApi";

interface KekaApiSettingsProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  onConfigured?: () => void;
}

export const KekaApiSettings: React.FC<KekaApiSettingsProps> = ({
  isOpen,
  onOpenChange,
  onConfigured
}) => {
  const [config, setConfig] = useState<KekaOAuthConfig>({
    clientId: '',
    clientSecret: '',
    apiKey: ''
  });
  const [isConfigured, setIsConfigured] = useState(false);
  const [showSecrets, setShowSecrets] = useState(false);
  const [isTesting, setIsTesting] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    const configured = kekaApiService.isConfigured();
    setIsConfigured(configured);
    
    if (configured) {
      // Load existing config (without secrets for security)
      const saved = localStorage.getItem('keka-api-config');
      if (saved) {
        const savedConfig = JSON.parse(saved);
        setConfig({
          clientId: savedConfig.clientId || '',
          clientSecret: '••••••••', // Mask for display
          apiKey: '••••••••' // Mask for display
        });
      }
    }
  }, [isOpen]);

  const handleInputChange = (field: keyof KekaOAuthConfig, value: string) => {
    setConfig(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSave = () => {
    if (!config.clientId.trim() || !config.clientSecret.trim() || !config.apiKey.trim()) {
      toast({
        title: "Validation Error",
        description: "All fields are required.",
        variant: "destructive"
      });
      return;
    }

    // Only save if values are not masked
    const configToSave = {
      clientId: config.clientId,
      clientSecret: config.clientSecret === '••••••••' ? undefined : config.clientSecret,
      apiKey: config.apiKey === '••••••••' ? undefined : config.apiKey
    };

    // Get existing config if some values are masked
    const existing = localStorage.getItem('keka-api-config');
    if (existing) {
      const existingConfig = JSON.parse(existing);
      kekaApiService.setConfig({
        clientId: configToSave.clientId,
        clientSecret: configToSave.clientSecret || existingConfig.clientSecret,
        apiKey: configToSave.apiKey || existingConfig.apiKey
      });
    } else {
      kekaApiService.setConfig(configToSave as KekaOAuthConfig);
    }

    setIsConfigured(true);
    toast({
      title: "Configuration Saved",
      description: "Keka API credentials have been saved successfully."
    });
    
    onConfigured?.();
  };

  const handleTest = async () => {
    if (!kekaApiService.isConfigured()) {
      toast({
        title: "Configuration Required",
        description: "Please save your configuration first.",
        variant: "destructive"
      });
      return;
    }

    setIsTesting(true);
    try {
      await kekaApiService.fetchProjects();
      toast({
        title: "Connection Successful",
        description: "Successfully connected to Keka API!"
      });
    } catch (error) {
      toast({
        title: "Connection Failed",
        description: error instanceof Error ? error.message : "Failed to connect to Keka API",
        variant: "destructive"
      });
    } finally {
      setIsTesting(false);
    }
  };

  const handleClear = () => {
    kekaApiService.clearConfig();
    setConfig({
      clientId: '',
      clientSecret: '',
      apiKey: ''
    });
    setIsConfigured(false);
    toast({
      title: "Configuration Cleared",
      description: "Keka API credentials have been removed."
    });
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Settings className="h-5 w-5" />
            Keka API Configuration
          </DialogTitle>
        </DialogHeader>
        
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm flex items-center gap-2">
              Status: {isConfigured ? (
                <Badge variant="default" className="flex items-center gap-1">
                  <CheckCircle className="h-3 w-3" />
                  Configured
                </Badge>
              ) : (
                <Badge variant="secondary" className="flex items-center gap-1">
                  <XCircle className="h-3 w-3" />
                  Not Configured
                </Badge>
              )}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="clientId">Client ID</Label>
              <Input
                id="clientId"
                value={config.clientId}
                onChange={(e) => handleInputChange('clientId', e.target.value)}
                placeholder="Enter your Keka Client ID"
              />
            </div>
            
            <div>
              <Label htmlFor="clientSecret">Client Secret</Label>
              <div className="relative">
                <Input
                  id="clientSecret"
                  type={showSecrets ? "text" : "password"}
                  value={config.clientSecret}
                  onChange={(e) => handleInputChange('clientSecret', e.target.value)}
                  placeholder="Enter your Keka Client Secret"
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="absolute right-2 top-1/2 -translate-y-1/2 h-6 w-6 p-0"
                  onClick={() => setShowSecrets(!showSecrets)}
                >
                  {showSecrets ? <EyeOff className="h-3 w-3" /> : <Eye className="h-3 w-3" />}
                </Button>
              </div>
            </div>
            
            <div>
              <Label htmlFor="apiKey">API Key</Label>
              <Input
                id="apiKey"
                type={showSecrets ? "text" : "password"}
                value={config.apiKey}
                onChange={(e) => handleInputChange('apiKey', e.target.value)}
                placeholder="Enter your Keka API Key"
              />
            </div>
            
            <div className="flex gap-2">
              <Button onClick={handleSave} className="flex-1">
                Save Configuration
              </Button>
              {isConfigured && (
                <Button
                  variant="outline"
                  onClick={handleTest}
                  disabled={isTesting}
                >
                  {isTesting ? "Testing..." : "Test"}
                </Button>
              )}
            </div>
            
            {isConfigured && (
              <Button
                variant="destructive"
                onClick={handleClear}
                className="w-full"
                size="sm"
              >
                Clear Configuration
              </Button>
            )}
          </CardContent>
        </Card>
      </DialogContent>
    </Dialog>
  );
};