import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/components/ui/use-toast";
import { Card } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Calendar, Clock } from "lucide-react";
import { format, addDays, isAfter, parseISO } from "date-fns";

interface DeliverySlot {
  id: string;
  date: string;
  start_time: string;
  end_time: string;
  max_orders: number;
  current_orders: number;
  is_available: boolean;
}

interface DeliverySlotSelectorProps {
  selectedSlotId: string | null;
  onSlotSelect: (slotId: string | null) => void;
}

const DeliverySlotSelector = ({ selectedSlotId, onSlotSelect }: DeliverySlotSelectorProps) => {
  const { toast } = useToast();
  const [slots, setSlots] = useState<DeliverySlot[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDeliverySlots();
  }, []);

  const fetchDeliverySlots = async () => {
    try {
      const today = new Date().toISOString().split('T')[0];
      
      const { data, error } = await supabase
        .from('delivery_slots')
        .select('*')
        .gte('date', today)
        .eq('is_available', true)
        .order('date', { ascending: true })
        .order('start_time', { ascending: true });

      if (error) throw error;
      setSlots(data || []);
    } catch (error) {
      // Silently fail - delivery slots will show as unavailable
      toast({
        title: "Error",
        description: "Failed to load delivery slots.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const formatTime = (time: string) => {
    return format(parseISO(`2000-01-01T${time}`), 'h:mm a');
  };

  const formatDate = (dateString: string) => {
    const date = parseISO(dateString);
    const today = new Date();
    const tomorrow = addDays(today, 1);
    
    if (format(date, 'yyyy-MM-dd') === format(today, 'yyyy-MM-dd')) {
      return 'Today';
    } else if (format(date, 'yyyy-MM-dd') === format(tomorrow, 'yyyy-MM-dd')) {
      return 'Tomorrow';
    } else {
      return format(date, 'EEEE, MMM d');
    }
  };

  const groupSlotsByDate = (slots: DeliverySlot[]) => {
    const grouped: { [date: string]: DeliverySlot[] } = {};
    
    slots.forEach(slot => {
      if (!grouped[slot.date]) {
        grouped[slot.date] = [];
      }
      grouped[slot.date].push(slot);
    });
    
    return grouped;
  };

  const isSlotAvailable = (slot: DeliverySlot) => {
    return slot.is_available && slot.current_orders < slot.max_orders;
  };

  if (loading) {
    return (
      <div className="space-y-4">
        <Label className="text-base font-medium">Delivery Time</Label>
        <div className="animate-pulse space-y-2">
          <div className="h-20 bg-gray-200 rounded"></div>
          <div className="h-20 bg-gray-200 rounded"></div>
          <div className="h-20 bg-gray-200 rounded"></div>
        </div>
      </div>
    );
  }

  const groupedSlots = groupSlotsByDate(slots);

  return (
    <div className="space-y-4">
      <Label className="text-base font-medium flex items-center">
        <Calendar className="h-4 w-4 mr-2" />
        Select Delivery Time
      </Label>
      
      {Object.keys(groupedSlots).length === 0 ? (
        <Card className="p-6 text-center">
          <p className="text-muted-foreground">No delivery slots available at the moment.</p>
          <p className="text-sm text-muted-foreground mt-2">Please try again later or contact customer service.</p>
        </Card>
      ) : (
        <div className="space-y-4">
          {Object.entries(groupedSlots).map(([date, dateSlots]) => (
            <div key={date}>
              <h4 className="font-medium text-foreground mb-2">
                {formatDate(date)}
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                {dateSlots.map((slot) => {
                  const available = isSlotAvailable(slot);
                  const selected = selectedSlotId === slot.id;
                  
                  return (
                    <Button
                      key={slot.id}
                      variant={selected ? "default" : "outline"}
                      className={`justify-start h-auto p-3 ${
                        !available ? 'opacity-50 cursor-not-allowed' : ''
                      }`}
                      disabled={!available}
                      onClick={() => onSlotSelect(selected ? null : slot.id)}
                    >
                      <div className="text-left">
                        <div className="flex items-center space-x-2">
                          <Clock className="h-4 w-4" />
                          <span className="font-medium">
                            {formatTime(slot.start_time)} - {formatTime(slot.end_time)}
                          </span>
                        </div>
                        <div className="text-xs mt-1 opacity-75">
                          {available 
                            ? `${slot.max_orders - slot.current_orders} slots available`
                            : 'Fully booked'
                          }
                        </div>
                      </div>
                    </Button>
                  );
                })}
              </div>
            </div>
          ))}
          
          {selectedSlotId && (
            <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded-lg">
              <p className="text-sm text-green-800">
                ✓ Delivery slot selected. Your order will be delivered during the selected time window.
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default DeliverySlotSelector;