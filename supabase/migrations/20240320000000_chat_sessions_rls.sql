-- Enable RLS
ALTER TABLE chat_sessions ENABLE ROW LEVEL SECURITY;

-- Policy for inserting chat sessions
CREATE POLICY "Users can insert their own chat sessions"
ON chat_sessions
FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);

-- Policy for selecting chat sessions
CREATE POLICY "Users can view their own chat sessions"
ON chat_sessions
FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

-- Policy for updating chat sessions
CREATE POLICY "Users can update their own chat sessions"
ON chat_sessions
FOR UPDATE
TO authenticated
USING (auth.uid() = user_id);