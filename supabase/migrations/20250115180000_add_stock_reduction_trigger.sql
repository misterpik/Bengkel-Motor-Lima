-- Function to update sparepart stock when service spareparts are added/updated/deleted
CREATE OR REPLACE FUNCTION update_sparepart_stock()
RETURNS TRIGGER AS $$
BEGIN
  -- Handle INSERT
  IF TG_OP = 'INSERT' THEN
    UPDATE spareparts 
    SET stock = stock - NEW.quantity,
        updated_at = NOW()
    WHERE id = NEW.sparepart_id;
    RETURN NEW;
  END IF;
  
  -- Handle UPDATE
  IF TG_OP = 'UPDATE' THEN
    -- Restore old quantity to stock
    UPDATE spareparts 
    SET stock = stock + OLD.quantity,
        updated_at = NOW()
    WHERE id = OLD.sparepart_id;
    
    -- Subtract new quantity from stock
    UPDATE spareparts 
    SET stock = stock - NEW.quantity,
        updated_at = NOW()
    WHERE id = NEW.sparepart_id;
    RETURN NEW;
  END IF;
  
  -- Handle DELETE
  IF TG_OP = 'DELETE' THEN
    UPDATE spareparts 
    SET stock = stock + OLD.quantity,
        updated_at = NOW()
    WHERE id = OLD.sparepart_id;
    RETURN OLD;
  END IF;
  
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for service_spareparts table
DROP TRIGGER IF EXISTS trigger_update_sparepart_stock ON service_spareparts;
CREATE TRIGGER trigger_update_sparepart_stock
  AFTER INSERT OR UPDATE OR DELETE ON service_spareparts
  FOR EACH ROW EXECUTE FUNCTION update_sparepart_stock();

-- Add constraint to prevent negative stock
ALTER TABLE spareparts ADD CONSTRAINT check_positive_stock CHECK (stock >= 0);