import { FastifyInstance } from "fastify";
import fs from "fs";
import Joi from "joi";
import { AssetsFileSchema, FileUploadSchema } from "../schema/file";
import * as FileServer from "../services/file";
import { GetFfmpegOption } from "../utils/constant";
import childProcess from "child-process-promise";
const gifshot = require('gifshot');

export const setupFileRouter = (app: FastifyInstance) => {
  // 文件上传
  app.post("/file/upload", FileUploadSchema, async (req, res) => {
    const file = await req.file();
    const buffer = await file.toBuffer();

    const result = await FileServer.addFile(file.filename, file.mimetype);
    const fileUrl = `./assets/${result.data?.id}.${result.data?.suffix}`;

    fs.appendFile(fileUrl, buffer, async err => {
      if (err) {
        res.status(500).send({ msg: err, code: 500 });
        return;
      }

      res
        .status(result.code)
        .send({ code: result.code, msg: result.msg, data: fileUrl.slice(1) });
    });
  });

  // 调取ffmpeg处理视频
  app.post(`/file/transform`, async (req, res) => {
    const file = await req.file();
    const buffer = await file.toBuffer();
    const arr = file.filename.split(".");

    const suffix = arr.pop() || "";
    const fileName = arr.join("");
    const fileUrl = `./assets/video/${fileName}.${suffix}`;

    fs.appendFile(fileUrl, buffer, async err => {
      if (err) {
        res.status(500).send({ msg: err, code: 500 });
        return;
      }

      if (!["avi"].includes(suffix)) {
        res.status(500).send({ msg: "上传文件的格式错误", code: 500 });
      }

      const optionsIns = GetFfmpegOption();
      optionsIns.add("-i", fileUrl);
      const transformedFilePath = `/assets/gif/${fileName}.gif`;
      optionsIns.add("-y", transformedFilePath);
      const resultStr = optionsIns.toString();

      console.log("视频转GIF：" + fileName);
      console.log(resultStr);
      childProcess.exec(`ffmpeg ${resultStr}`).then((result) => {
        res.status(200).send({
          code: 200,
          data: {
            resultStr,
            result
          }
        });
      }).catch((err) => {
        res.status(500).send({
          code: 500,
          err
        });
      });

    //   res
    //     .status(result.code)
    //     .send({ code: result.code, msg: result.msg, data: fileUrl.slice(1) });
    // });
  });

  // 静态文件获取
  app.get("/assets/:id", AssetsFileSchema, async (req, res) => {
    const params = req.params as { id: string };
    const id = params.id;

    const fileInfo = await FileServer.getFileInfo(id);

    if (fileInfo.code === 200) {
      fs.readFile(
        `.${fileInfo.data?.url}`,
        { encoding: "binary" },
        (err, data) => {
          const buffer = Buffer.from(data, "binary");
          if (err) {
            res.status(404).send(fileInfo.msg);
            return;
          }
          res
            .status(200)
            .headers({
              "Content-Disposition": `attachment;filename="${encodeURIComponent(
                fileInfo.data?.filename || ""
              )}"`,
              "content-type": fileInfo.data?.fileType,
              "content-length": buffer.byteLength
            })
            .send(buffer);
        }
      );
    } else {
      res.status(404).send(fileInfo.msg);
    }
  });
};
