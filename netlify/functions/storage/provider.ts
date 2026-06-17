export interface TextData {
  text: string;
  createdAt: number;
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
   * Delete a text message.
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
}
