import { applyDecorators, Type } from '@nestjs/common';
import { ApiExtraModels, ApiOkResponse, getSchemaPath } from '@nestjs/swagger';
import { WebResponse } from '../model/web.model';

export const ApiDetailResponse = <TModel extends Type<any>>(model: TModel) => {
  return applyDecorators(
    ApiExtraModels(model),
    ApiOkResponse({
      schema: {
        title: `ApiDetailResponseOf${model.name}`,
        allOf: [
          { $ref: getSchemaPath(WebResponse) },
          {
            properties: {
              data: {
                type: 'object',
                $ref: getSchemaPath(model),
              },
            },
          },
        ],
      },
    }),
  );
};
