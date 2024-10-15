import {
  CanActivate,
  ExecutionContext,
  Injectable,
  InternalServerErrorException,
} from '@nestjs/common';
import { SessionService } from 'src/api/session/session.service';

@Injectable()
export class SessionGuard implements CanActivate {
  constructor(private readonly sessionService: SessionService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const sessionId = request.sessionID;

    try {
      if (sessionId) {
        const session = await this.sessionService.getSession(sessionId);

        if (session && !session.userAgent)
          await this.sessionService.updateSession(sessionId, request);

        if (!session || new Date() > session.expire) {
          request.session.regenerate((err) => {
            if (err) {
              throw new InternalServerErrorException(
                "Sessiyani yaratib bo'lmadi",
              );
            }
          });

          return true;
        }

        return true;
      }
    } catch (error) {
      console.log(error);
      throw new InternalServerErrorException(
        "Sessiya bilan bog'liq muammo yuz berdi",
      );
    }
  }
}
