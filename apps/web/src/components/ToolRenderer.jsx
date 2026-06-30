import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Calculator, Lock } from 'lucide-react';
import { calculateToolResult } from '@/utils/ToolConfigLoader';
import ToolResults from './ToolResults.jsx';
import LeadCaptureForm from './LeadCaptureForm.jsx';
import LoadingAnimation from './LoadingAnimation.jsx';

const ToolRenderer = ({ tool, onBack }) => {
  const requiresOtp = tool.requiresOTP || false;

  const [inputValues, setInputValues] = useState({});
  const [results, setResults] = useState(null);
  
  // Flow states
  const [showLeadCapture, setShowLeadCapture] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const [userName, setUserName] = useState('');
  
  // Strict verification state
  const [isVerified, setIsVerified] = useState(!requiresOtp);

  const formatDisplayNumber = (val) => {
    if (!val) return '';
    const num = parseFloat(val);
    if (isNaN(num)) return val;
    return new Intl.NumberFormat('en-US').format(num);
  };

  const handleInputChange = (name, value, type) => {
    if (type === 'number') {
      const raw = value.replace(/[^0-9.]/g, '');
      setInputValues({ ...inputValues, [name]: raw });
    } else {
      setInputValues({ ...inputValues, [name]: value });
    }
  };

  const handleCalculate = () => {
    const calculatedResults = calculateToolResult(tool, inputValues);
    setResults(calculatedResults);
    
    // Reset verification on new calculation if tool requires OTP
    setIsVerified(!requiresOtp); 
    
    setShowLeadCapture(true);
    setShowResults(true);
  };

  const handleLeadCaptureSuccess = (capturedName, verifiedStatus) => {
    setShowLeadCapture(false);
    setUserName(capturedName);
    
    // Update verification strictly from the form
    setIsVerified(verifiedStatus);
    setIsAnalyzing(true);

    // 3-second premium loading transition
    setTimeout(() => {
      setIsAnalyzing(false);
    }, 3000);
  };

  const isFormValid = () => {
    if (tool.id === 'millionaire_solver') {
      const emptyCount = tool.inputs.filter(input => !inputValues[input.name]).length;
      return emptyCount <= 1;
    }
    
    return tool.inputs
      .filter(input => input.required)
      .every(input => inputValues[input.name] && inputValues[input.name] !== '');
  };

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-extrabold text-foreground mb-2 tracking-tight">{tool.title}</h2>
          <p className="text-muted-foreground text-lg max-w-2xl">{tool.description}</p>
        </div>
        <Button
          variant="outline"
          onClick={onBack}
          className="border-border text-foreground hover:bg-muted"
        >
          Back to Tools
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="bg-card rounded-2xl border border-border p-6 shadow-sm">
          <h3 className="text-xl font-semibold mb-6 text-foreground">Your Details</h3>
          
          {tool.id === 'millionaire_solver' && (
            <div className="mb-6 p-4 bg-primary/10 border border-primary/20 rounded-xl text-sm text-primary">
              💡 <strong>Pro Tip:</strong> Fill in any 3 fields and leave 1 blank. We'll automatically calculate the missing piece for your financial plan.
            </div>
          )}

          <div className="space-y-5">
            {tool.inputs.map((input) => (
              <div key={input.name} className="space-y-2">
                <Label htmlFor={input.name} className="text-foreground font-medium">
                  {input.label}
                  {input.required && <span className="text-destructive ml-1">*</span>}
                </Label>
                
                {input.type === 'select' ? (
                  <Select
                    value={inputValues[input.name] || ''}
                    onValueChange={(value) => handleInputChange(input.name, value, 'select')}
                  >
                    <SelectTrigger className="bg-input border-border text-foreground focus:ring-primary">
                      <SelectValue placeholder={`Select ${input.label.toLowerCase()}`} />
                    </SelectTrigger>
                    <SelectContent className="bg-popover border-border text-popover-foreground">
                      {input.options.map((option) => (
                        <SelectItem key={option.value} value={option.value} className="focus:bg-muted focus:text-foreground cursor-pointer">
                          {option.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                ) : (
                  <div className="relative">
                    {input.label.includes('($)') && (
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">$</span>
                    )}
                    <Input
                      id={input.name}
                      type="text"
                      value={input.type === 'number' && inputValues[input.name] ? formatDisplayNumber(inputValues[input.name]) : (inputValues[input.name] || '')}
                      onChange={(e) => handleInputChange(input.name, e.target.value, input.type)}
                      className={`bg-input border-border text-foreground placeholder:text-muted-foreground focus-visible:ring-primary ${input.label.includes('($)') ? 'pl-8' : ''}`}
                      placeholder={input.type === 'number' ? '0' : `Enter ${input.label.toLowerCase()}`}
                    />
                  </div>
                )}
              </div>
            ))}
          </div>

          <Button
            onClick={handleCalculate}
            disabled={!isFormValid()}
            className="w-full mt-8 bg-primary text-primary-foreground hover:brightness-110 py-6 text-lg font-semibold transition-all active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-primary/20"
          >
            <Calculator className="w-5 h-5 mr-2" />
            Generate Blueprint
          </Button>
        </div>

        <div className="h-full relative overflow-hidden rounded-2xl min-h-[400px]">
          {isAnalyzing && <LoadingAnimation userName={userName} />}
          
          {/* Unverified Locked State */}
          {!isAnalyzing && showResults && results && requiresOtp && !isVerified && (
            <div className="bg-card/50 rounded-2xl border border-dashed border-border p-8 h-full flex flex-col items-center justify-center text-center animate-in fade-in duration-500">
              <div className="w-20 h-20 rounded-full bg-muted flex items-center justify-center mb-6">
                <Lock className="w-10 h-10 text-muted-foreground/50" />
              </div>
              <h4 className="text-xl font-medium text-foreground mb-2">Results Locked</h4>
              <p className="text-muted-foreground max-w-sm mb-6">Please verify your phone number with OTP to see results.</p>
              <Button onClick={() => setShowLeadCapture(true)} className="bg-primary text-primary-foreground hover:brightness-110">
                Verify Now
              </Button>
            </div>
          )}

          {/* Verified Tool Results */}
          {!isAnalyzing && showResults && results && (!requiresOtp || isVerified) && (
            <ToolResults 
              results={results} 
              resultConfig={tool.results} 
              toolId={tool.id} 
              isVerified={isVerified}
              requiresOtp={requiresOtp}
            />
          )}
          
          {/* Initial Awaiting Input State */}
          {!isAnalyzing && !showResults && (
            <div className="bg-card/50 rounded-2xl border border-dashed border-border p-8 h-full flex flex-col items-center justify-center text-center">
              <div className="w-20 h-20 rounded-full bg-muted flex items-center justify-center mb-6">
                <Calculator className="w-10 h-10 text-muted-foreground/50" />
              </div>
              <h4 className="text-xl font-medium text-foreground mb-2">Awaiting Inputs</h4>
              <p className="text-muted-foreground max-w-sm">Provide your details to unlock a personalized, data-driven financial breakdown.</p>
            </div>
          )}
        </div>
      </div>

      <LeadCaptureForm
        isOpen={showLeadCapture}
        onClose={() => setShowLeadCapture(false)}
        toolId={tool.id}
        toolTitle={tool.title}
        calculationResults={results}
        onSubmitSuccess={handleLeadCaptureSuccess}
        requiresOtp={requiresOtp}
      />
    </div>
  );
};

export default ToolRenderer;