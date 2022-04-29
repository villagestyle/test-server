import { RouteShorthandOptions } from "fastify";

export const FileUploadSchema: RouteShorthandOptions = {
  schema: {
    tags: ["file"],
    summary: "文件上传",
    description: "文件上传接口",
    consumes: ["multipart/form-data"],
    body: {
      type: "object",
      required: ["file"],
      properties: {
        file: { type: "string", description: "上传的文件流" }
      }
    },
    response: {
      200: {
        description: "上传成功",
        type: "object",
        properties: {
          code: { type: "number" },
          msg: { type: "string" },
          data: { type: "string", description: "返回的文件url" }
        }
      }
    }
  }
};

export const AssetsFileSchema: RouteShorthandOptions = {
  schema: {
    tags: ["file"],
    summary: "获取静态资源",
    description: "获取静态资源",
    consumes: ["multipart/form-data"],
    params: {
      type: "object",
      required: ["id"],
      properties: {
        id: { type: "string", description: "文件id" }
      }
    },
    response: {
      200: {
        description: "返回文件流",
        type: "string"
      }
    }
  }
};
