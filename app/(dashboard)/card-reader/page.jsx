"use client";

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import dynamic from 'next/dynamic';

// Dynamically import the CardReaderMonitor component with no SSR
// This is needed because it uses browser-only APIs
const CardReaderMonitor = dynamic(
  () => import('../../../client/components/CardReaderMonitor'),
  { ssr: false }
);

export default function CardReaderPage() {
  const [activeTab, setActiveTab] = useState("monitor");

  return (
    <div className="flex flex-col gap-5">
      <div className="flex flex-col gap-1">
        <h1 className="text-3xl font-bold">Card Reader Management</h1>
        <p className="text-muted-foreground">
          Connect to and manage the RFID card reader for equipment checkout
        </p>
      </div>

      <Tabs defaultValue="monitor" className="w-full" onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="monitor">Monitor</TabsTrigger>
          <TabsTrigger value="settings">Settings</TabsTrigger>
          <TabsTrigger value="logs">Logs</TabsTrigger>
        </TabsList>
        
        <TabsContent value="monitor" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Card Reader Monitor</CardTitle>
              <CardDescription>
                Connect to the card reader, view status, and manage connections
              </CardDescription>
            </CardHeader>
            <CardContent>
              <CardReaderMonitor />
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="settings" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Card Reader Settings</CardTitle>
              <CardDescription>
                Configure the card reader connection parameters
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p>Settings content will be implemented in a future update.</p>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="logs" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Connection Logs</CardTitle>
              <CardDescription>
                View detailed connection and event logs
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p>Logs content will be implemented in a future update.</p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
} 