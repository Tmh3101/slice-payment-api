import { ContentfulStatusCode } from 'hono/utils/http-status';
import { HTTPException } from 'hono/http-exception';

export class AppError extends HTTPException {
  public readonly errorCode?: string;

  constructor(status: ContentfulStatusCode, message: string, errorCode?: string) {
    super(
        status,
        {
            message,
            res: new Response(message, { status })
        }
    );
    this.errorCode = errorCode;
  }
}