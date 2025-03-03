-- Add order_index column to forum_categories
ALTER TABLE forum_categories ADD COLUMN IF NOT EXISTS order_index integer DEFAULT 0;

-- Update existing categories with order
UPDATE forum_categories SET order_index = CASE
  WHEN slug = 'general-discussion' THEN 1
  WHEN slug = 'clinical-questions' THEN 2
  WHEN slug = 'case-discussions' THEN 3
  WHEN slug = 'research-literature' THEN 4
  WHEN slug = 'practice-management' THEN 5
  WHEN slug = 'integration-techniques' THEN 6
  WHEN slug = 'professional-development' THEN 7
  WHEN slug = 'technology-tools' THEN 8
  ELSE 9
END;

-- Add index for better performance
CREATE INDEX IF NOT EXISTS idx_forum_categories_order ON forum_categories(order_index);