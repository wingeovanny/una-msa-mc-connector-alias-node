import { Logger } from '@deuna/node-logger-lib';
import { mapSystemErrors, ErrorObjectType } from '@deuna/node-shared-lib';
import {
  CustomException,
  DefaultErrorException,
  InvalidPayloadException,
  EntityDoesNotExistException,
} from '@deuna/node-shared-lib';
import { EntityColumnNotFound, UpdateValuesMissingError } from 'typeorm';
import { HttpStatus, Injectable } from '@nestjs/common';

type QrTranslateExeptions = {
  400: InvalidPayloadException;
  404: EntityDoesNotExistException;
  500: DefaultErrorException;
  default: DefaultErrorException;
};

@Injectable()
export class ErrorCustomizer {
  constructor(private logger: Logger) {}

  customizeError = (
    err: any,
    maskedValue?: string,
    trackingId?: string,
  ): CustomException => {
    let logMessage;
    if (err instanceof CustomException) {
      logMessage = maskedValue
        ? `${err.error.message} for ${maskedValue}`
        : err.error.message;
      this.logger.error(logMessage, null, trackingId);
      return err;
    }

    const trace = err.message;
    const errors: ErrorObjectType[] = mapSystemErrors(err);
    const exceptions: QrTranslateExeptions = {
      400: new InvalidPayloadException(errors, maskedValue, trackingId),
      404: new EntityDoesNotExistException(errors, maskedValue, trackingId),
      500: new DefaultErrorException(errors, maskedValue, trackingId),
      default: new DefaultErrorException(
        mapSystemErrors(),
        maskedValue,
        trackingId,
      ),
    };

    let status: number | string;

    if (
      err.name === EntityColumnNotFound.name ||
      err.name === UpdateValuesMissingError.name
    ) {
      status = HttpStatus.BAD_REQUEST;
    } // duplicate value constraint error
    else if (err.code === '23505') {
      status = HttpStatus.CONFLICT;
    } else {
      status = 'default';
    }

    const errorResponse: CustomException = exceptions[status];

    logMessage = maskedValue
      ? `${errorResponse.error.message} for ${maskedValue}`
      : errorResponse.error.message;

    this.logger.error(logMessage, trace, trackingId);

    return errorResponse;
  };
}
