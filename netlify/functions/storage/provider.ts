export interface TextData {
  text: string;
  createdAt: number;
}

export interface FileMetadata {
  type: 'file';
  fileKey: string;
  filename: string;
  size: number;
  mimeType: string;
  uploadedAt: number;
}

export interface StorageProvider {
  /**
   * Save a text message. Returns true if saved, false if code already exists.
   */
  saveMessage(code: string, text: string, ttlSeconds: number): Promise<boolean>;
  
  /**
   * Get a text message. Returns the text data or null if not found/expired.
   */
  getMessage(code: string): Promise<TextData | null>;

  /**
   * Save file metadata. Returns true if saved, false if code already exists.
   */
  saveFileMetadata(code: string, metadata: FileMetadata, ttlSeconds: number): Promise<boolean>;

  /**
   * Get file metadata. Returns the metadata or null if not found/expired.
   */
  getFileMetadata(code: string): Promise<FileMetadata | null>;
  
  /**
   * Delete a text message or file metadata.
   */
  deleteMessage(code: string): Promise<void>;
  
  /**
   * Get remaining TTL for a code in seconds. Returns -1 if not found.
   */
  getTTL(code: string): Promise<number>;

  /**
   * Register a failed receive attempt for an IP.
   */
  registerFailedAttempt(ip: string): Promise<number>;

  /**
   * Reset failed attempts for an IP.
   */
  resetFailedAttempts(ip: string): Promise<void>;

  /**
   * Block an IP for a certain amount of time.
   */
  blockIp(ip: string, durationSeconds: number): Promise<void>;

  /**
   * Check if an IP is blocked.
   */
  isIpBlocked(ip: string): Promise<boolean>;

  // --- Rate limiting for files ---

  /**
   * Register a file upload and return the updated total size and count for the IP today.
   */
  trackFileUploadRateLimit(ip: string, sizeBytes: number): Promise<{ size: number; count: number }>;

  // --- Cron tracking ---

  /**
   * Get a list of all active file codes (for cleanup cron).
   */
  getActiveFileCodes(): Promise<string[]>;

  /**
   * Remove a file code from the active list (called after cleanup).
   */
  removeActiveFileCode(code: string): Promise<void>;
}
