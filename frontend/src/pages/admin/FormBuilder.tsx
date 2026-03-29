import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Trash2, Plus, ArrowUp, ArrowDown, Save, Eye } from "lucide-react";
import { api } from "@/lib/api";

const EVENT_CATEGORIES = [
  { value: "wedding", label: "Wedding" },
  { value: "engagement", label: "Engagement" },
  { value: "birthday", label: "Birthday" },
  { value: "religious", label: "Religious" },
  { value: "cultural", label: "Cultural" },
  { value: "housewarming", label: "Housewarming" },
  { value: "baby-shower", label: "Baby Shower" },
  { value: "anniversary", label: "Anniversary" },
];

const FIELD_TYPES = [
  { value: "text", label: "Short Text" },
  { value: "textarea", label: "Long Text (Paragraph)" },
  { value: "date", label: "Date Picker" },
  { value: "time", label: "Time Picker" },
  { value: "select", label: "Dropdown (Select)" },
];

export function FormBuilder() {
  const [activeCategory, setActiveCategory] = useState("wedding");
  const [template, setTemplate] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState<{ msg: string; type: "success" | "error" } | null>(null);

  useEffect(() => {
    fetchTemplate(activeCategory);
  }, [activeCategory]);

  const showToast = (msg: string, type: "success" | "error" = "success") => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3000);
  };

  const fetchTemplate = async (category: string) => {
    setLoading(true);
    try {
      const res = await api.get(`/form-templates/category/${category}`);
      setTemplate(res.data);
    } catch (err: any) {
      if (err.response?.status === 404) {
        // Initialize an empty template for this category
        setTemplate({
          category,
          name: `${EVENT_CATEGORIES.find(c => c.value === category)?.label} Form`,
          fields: [],
          is_active: true
        });
      } else {
        showToast("Failed to fetch form template", "error");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!template) return;
    setSaving(true);
    try {
      if (template.id) {
        // Update existing
        await api.patch(`/form-templates/${template.id}`, {
          name: template.name,
          fields: template.fields,
          is_active: template.is_active
        });
        showToast("Form template updated automatically!");
      } else {
        // Create new
        const res = await api.post(`/form-templates`, template);
        setTemplate(res.data);
        showToast("Form template created successfully!");
      }
    } catch (err) {
      showToast("Failed to save template", "error");
      console.error(err);
    } finally {
      setSaving(false);
    }
  };

  const addField = () => {
    const newField = {
      id: `field_${Date.now()}`,
      type: "text",
      label: "New Field",
      placeholder: "",
      required: false,
      options: []
    };
    setTemplate({ ...template, fields: [...template.fields, newField] });
  };

  const updateField = (id: string, updates: any) => {
    setTemplate({
      ...template,
      fields: template.fields.map((f: any) => f.id === id ? { ...f, ...updates } : f)
    });
  };

  const removeField = (id: string) => {
    setTemplate({
      ...template,
      fields: template.fields.filter((f: any) => f.id !== id)
    });
  };

  const moveField = (index: number, direction: 'up' | 'down') => {
    const newFields = [...template.fields];
    if (direction === 'up' && index > 0) {
      [newFields[index - 1], newFields[index]] = [newFields[index], newFields[index - 1]];
    } else if (direction === 'down' && index < newFields.length - 1) {
      [newFields[index + 1], newFields[index]] = [newFields[index], newFields[index + 1]];
    }
    setTemplate({ ...template, fields: newFields });
  };

  if (loading) return <div className="py-24 text-center">Loading template...</div>;

  return (
    <div className="space-y-6">
      {/* Toast Notification */}
      {toast && (
        <div className={`fixed top-4 right-4 z-50 px-4 py-3 rounded-xl shadow-lg border text-sm font-semibold flex items-center gap-2 animate-in slide-in-from-top-2 ${toast.type === "success" ? "bg-green-50 text-green-700 border-green-200" : "bg-red-50 text-red-700 border-red-200"}`}>
          {toast.msg}
        </div>
      )}

      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b pb-6">
        <div>
          <h2 className="text-2xl font-bold font-serif">Dynamic Form Builder</h2>
          <p className="text-muted-foreground text-sm mt-1">Configure the exact fields customers need to fill out during checkout for specific events.</p>
        </div>
        <div className="flex items-center gap-3">
          <Label className="font-semibold whitespace-nowrap">Event Category:</Label>
          <select 
            className="p-2 border rounded-md min-w-[200px] font-medium"
            value={activeCategory}
            onChange={(e) => setActiveCategory(e.target.value)}
          >
            {EVENT_CATEGORIES.map(c => (
              <option key={c.value} value={c.value}>{c.label}</option>
            ))}
          </select>
        </div>
      </div>

      {!template ? (
        <div className="text-center py-12 text-muted-foreground border-2 border-dashed rounded-xl">No template data loaded.</div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          
          {/* LEFT: Builder Canvas */}
          <div className="space-y-6">
            <Card className="border-primary/20 shadow-sm">
              <CardHeader className="bg-primary/5 pb-4 border-b">
                <div className="flex justify-between items-center">
                  <Input 
                    value={template.name} 
                    onChange={e => setTemplate({...template, name: e.target.value})}
                    className="font-bold text-lg border-transparent hover:border-input focus:border-input px-1 py-1 h-auto -ml-1 w-2/3"
                  />
                  <div className="flex items-center gap-2 text-sm">
                    <Label className="cursor-pointer text-muted-foreground">Active Form</Label>
                    <Switch checked={template.is_active} onCheckedChange={v => setTemplate({...template, is_active: v})} />
                  </div>
                </div>
              </CardHeader>
              <CardContent className="p-4 space-y-4">
                
                {template.fields.length === 0 ? (
                  <div className="text-center py-12 bg-muted/20 border-2 border-dashed rounded-lg">
                    <p className="text-muted-foreground mb-4">No fields added to this form yet.</p>
                    <Button onClick={addField} variant="outline" size="sm"><Plus className="h-4 w-4 mr-1"/> Add First Field</Button>
                  </div>
                ) : (
                  template.fields.map((field: any, index: number) => (
                    <div key={field.id} className="border rounded-lg bg-white shadow-sm p-4 relative group hover:border-primary/40 transition-colors">
                      
                      {/* Field Reorder Controls */}
                      <div className="absolute top-2 -left-3 flex flex-col gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button onClick={() => moveField(index, 'up')} disabled={index === 0} className="bg-white border rounded shadow-sm p-0.5 hover:bg-zinc-100 disabled:opacity-30"><ArrowUp className="w-3 h-3" /></button>
                        <button onClick={() => moveField(index, 'down')} disabled={index === template.fields.length - 1} className="bg-white border rounded shadow-sm p-0.5 hover:bg-zinc-100 disabled:opacity-30"><ArrowDown className="w-3 h-3" /></button>
                      </div>

                      <div className="flex justify-between items-start gap-4 mb-4 border-b pb-4">
                        <div className="flex-1 space-y-3">
                          <div className="flex gap-3">
                            <div className="flex-1">
                              <Label className="text-[10px] uppercase text-muted-foreground font-semibold mb-1 block">Field Label</Label>
                              <Input value={field.label} onChange={e => updateField(field.id, { label: e.target.value })} className="font-medium" />
                            </div>
                            <div className="w-1/3">
                              <Label className="text-[10px] uppercase text-muted-foreground font-semibold mb-1 block">Type</Label>
                              <select 
                                className="w-full h-10 px-3 py-2 border rounded-md text-sm bg-background border-input ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                                value={field.type}
                                onChange={e => updateField(field.id, { type: e.target.value })}
                              >
                                {FIELD_TYPES.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
                              </select>
                            </div>
                          </div>

                          <div className="flex items-center justify-between gap-4">
                            <div className="flex-1">
                              {(field.type === 'text' || field.type === 'textarea') && (
                                <Input 
                                  placeholder="Input Placeholder (Optional)" 
                                  value={field.placeholder || ""} 
                                  onChange={e => updateField(field.id, { placeholder: e.target.value })} 
                                  className="text-xs h-8 bg-muted/30"
                                />
                              )}
                              {field.type === 'select' && (
                                <Input 
                                  placeholder="Options (comma separated)" 
                                  value={(field.options || []).join(", ")} 
                                  onChange={e => updateField(field.id, { options: e.target.value.split(",").map((s: string) => s.trim()).filter(Boolean) })} 
                                  className="text-xs h-8"
                                />
                              )}
                            </div>
                            <div className="flex items-center gap-2">
                              <Label className="text-xs whitespace-nowrap cursor-pointer">Required?</Label>
                              <Switch checked={field.required} onCheckedChange={v => updateField(field.id, { required: v })} />
                            </div>
                          </div>
                        </div>

                        <Button variant="ghost" size="sm" onClick={() => removeField(field.id)} className="text-red-500 hover:text-red-700 hover:bg-red-50 px-2 h-8">
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ))
                )}
                
                {template.fields.length > 0 && (
                  <Button onClick={addField} variant="outline" className="w-full border-dashed"><Plus className="h-4 w-4 mr-2"/> Add Another Field</Button>
                )}
              </CardContent>
            </Card>
            
            <div className="flex justify-end pt-4">
              <Button onClick={handleSave} disabled={saving} size="lg" className="w-full md:w-auto min-w-[200px]">
                {saving ? "Saving..." : <><Save className="w-4 h-4 mr-2" /> Save Form Template</>}
              </Button>
            </div>
          </div>

          {/* RIGHT: Live Preview */}
          <div className="lg:sticky lg:top-8 h-fit">
            <h3 className="text-sm font-bold uppercase tracking-wider text-muted-foreground mb-4 flex items-center gap-2"><Eye className="w-4 h-4" /> Live Customer Preview</h3>
            
            <Card className="border shadow-lg bg-zinc-50 overflow-hidden">
              <div className="h-2 bg-primary w-full"></div>
              <CardHeader className="bg-white border-b pb-4">
                <CardTitle className="text-xl font-serif text-primary">{template.name}</CardTitle>
                <p className="text-sm text-muted-foreground">Please provide the exact details you want printed.</p>
              </CardHeader>
              <CardContent className="p-6 bg-white space-y-5">
                {template.fields.length === 0 ? (
                  <div className="text-sm text-muted-foreground italic text-center py-8">Form preview will appear here</div>
                ) : (
                  template.fields.map((field: any) => (
                    <div key={`preview_${field.id}`} className="space-y-1.5">
                      <Label className="text-sm font-medium">
                        {field.label} {field.required && <span className="text-red-500">*</span>}
                      </Label>
                      
                      {field.type === 'text' && (
                        <Input placeholder={field.placeholder || `Enter ${field.label.toLowerCase()}`} disabled className="bg-zinc-50" />
                      )}
                      
                      {field.type === 'textarea' && (
                        <textarea 
                          className="w-full p-3 border rounded-md text-sm bg-zinc-50 focus:outline-none" 
                          rows={3} 
                          placeholder={field.placeholder || `Enter ${field.label.toLowerCase()}`}
                          disabled
                        />
                      )}
                      
                      {field.type === 'date' && (
                        <Input type="date" disabled className="bg-zinc-50" />
                      )}
                      
                      {field.type === 'time' && (
                        <Input type="time" disabled className="bg-zinc-50" />
                      )}
                      
                      {field.type === 'select' && (
                        <select className="w-full p-2 border rounded-md text-sm bg-zinc-50" disabled>
                          <option value="">Select an option</option>
                          {(field.options || []).map((opt: string) => (
                            <option key={opt} value={opt}>{opt}</option>
                          ))}
                        </select>
                      )}
                    </div>
                  ))
                )}
                
                <div className="pt-4 border-t mt-6 flex justify-between">
                  <Button variant="outline" disabled>Back</Button>
                  <Button disabled>Next: Delivery Address</Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      )}
    </div>
  );
}
