import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";

export default function ConnectionTest() {
  const [status, setStatus] = useState<'idle' | 'testing' | 'success' | 'error'>('idle');
  const [message, setMessage] = useState('');
  const [details, setDetails] = useState<any>(null);

  const testConnection = async () => {
    setStatus('testing');
    setMessage('Testing connection...');
    setDetails(null);

    try {
      // Test 1: Basic connectivity
      const response = await fetch('http://127.0.0.1:8000/api/auth/login/', {
        method: 'OPTIONS',
        headers: {
          'Origin': window.location.origin,
        },
      });

      if (response.ok) {
        setStatus('success');
        setMessage('✅ Backend is reachable and CORS is configured!');
        setDetails({
          status: response.status,
          corsHeaders: response.headers.get('Access-Control-Allow-Origin'),
        });
      } else {
        setStatus('error');
        setMessage('⚠️ Server responded but might have issues');
        setDetails({ status: response.status });
      }
    } catch (error: any) {
      setStatus('error');
      setMessage('❌ Cannot connect to backend');
      setDetails({ error: error.message });
    }
  };

  const testLogin = async () => {
    setStatus('testing');
    setMessage('Testing login endpoint...');
    setDetails(null);

    try {
      const response = await fetch('http://127.0.0.1:8000/api/auth/login/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          username: 'algotrader',
          password: 'Trading@2024',
        }),
      });

      const data = await response.json();

      if (response.ok) {
        setStatus('success');
        setMessage('✅ Login successful! Backend is working!');
        setDetails(data);
      } else {
        setStatus('error');
        setMessage('❌ Login failed');
        setDetails(data);
      }
    } catch (error: any) {
      setStatus('error');
      setMessage('❌ Connection error');
      setDetails({ error: error.message });
    }
  };

  const clearLocalStorage = () => {
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    setStatus('idle');
    setMessage('');
    setDetails(null);
    alert('✅ Tokens cleared from localStorage');
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 p-4">
      <Card className="w-full max-w-2xl">
        <CardHeader>
          <CardTitle className="text-2xl">🔧 Connection Diagnostics</CardTitle>
          <CardDescription>
            Test your frontend-backend connection
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-wrap gap-2">
            <Button onClick={testConnection} disabled={status === 'testing'}>
              Test Connection
            </Button>
            <Button onClick={testLogin} disabled={status === 'testing'} variant="secondary">
              Test Login
            </Button>
            <Button onClick={clearLocalStorage} variant="outline">
              Clear Tokens
            </Button>
          </div>

          {message && (
            <Alert variant={status === 'error' ? 'destructive' : 'default'}>
              <AlertDescription>{message}</AlertDescription>
            </Alert>
          )}

          {details && (
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <span className="font-semibold">Status:</span>
                <Badge variant={status === 'success' ? 'default' : 'destructive'}>
                  {status.toUpperCase()}
                </Badge>
              </div>
              <div className="bg-muted p-4 rounded-lg">
                <pre className="text-xs overflow-auto">
                  {JSON.stringify(details, null, 2)}
                </pre>
              </div>
            </div>
          )}

          <div className="border-t pt-4 mt-4">
            <h3 className="font-semibold mb-2">Debug Information</h3>
            <div className="text-sm space-y-1 text-muted-foreground">
              <p>• Backend URL: http://127.0.0.1:8000</p>
              <p>• Frontend URL: {window.location.origin}</p>
              <p>• Token in Storage: {localStorage.getItem('access_token') ? '✅ Yes' : '❌ No'}</p>
            </div>
          </div>

          <div className="border-t pt-4">
            <h3 className="font-semibold mb-2">Troubleshooting Steps</h3>
            <ol className="text-sm space-y-1 list-decimal list-inside text-muted-foreground">
              <li>Make sure Django server is running: <code className="bg-muted px-1">python manage.py runserver</code></li>
              <li>Check if port 8000 is accessible in your browser: <a href="http://127.0.0.1:8000/api/" target="_blank" className="text-primary underline">http://127.0.0.1:8000/api/</a></li>
              <li>If you see CORS errors, check Django settings.py CORS configuration</li>
              <li>Clear old tokens using the "Clear Tokens" button above</li>
            </ol>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
