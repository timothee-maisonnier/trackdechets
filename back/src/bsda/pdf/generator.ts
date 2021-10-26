import { Bsda } from "@prisma/client";
import { format } from "date-fns";
import { readFile } from "fs/promises";
import Handlebars from "handlebars";
import { join, basename } from "path";
import * as QRCode from "qrcode";
import { toPDF } from "../../common/pdf";
import { BsdaPackaging } from "../../generated/graphql/types";
import { getBsdaHistory } from "../database";

export async function buildPdf(bsda: Bsda) {
  const assetsPath = join(__dirname, "assets");
  const templatePath = join(assetsPath, "index.html");
  const stampPath = join(assetsPath, "stamp.svg");
  const cssPaths = [
    join(assetsPath, "modern-normalize.css"),
    join(assetsPath, "styles.css")
  ];

  const signatureStamp = await readFile(stampPath, "utf-8");
  const template = await readFile(templatePath, "utf-8");

  Handlebars.registerHelper("dateFmt", safeDateFmt);
  Handlebars.registerHelper("eq", eq);

  const qrcode = await QRCode.toString(bsda.id, { type: "svg" });
  const source = template.toString();
  const compiled = Handlebars.compile(source);

  const previousBsdas = await getBsdaHistory(bsda);
  const html = compiled({
    bsda,
    qrcode,
    signatureStamp,
    packagings: (bsda.packagings as BsdaPackaging[])
      .map(
        packaging =>
          `${packaging.quantity ?? 0}} x ${packaging.type} ${packaging.other}`
      )
      .join(" / "),
    nbOfPackagings: (bsda.packagings as BsdaPackaging[]).reduce(
      (prev, cur) => prev + cur.quantity,
      0
    ),
    previousBsdas: [
      ...previousBsdas,
      // Show a minimum of 5 rows
      ...Array.from({ length: 5 - previousBsdas.length }).fill({})
    ]
  });

  const files = {
    "index.html": html
  };

  for (const cssPath of cssPaths) {
    const content = await readFile(cssPath, "utf-8");
    files[basename(cssPath)] = content;
  }

  return toPDF(files);
}

const safeDateFmt = (dt: Date) => {
  if (!dt) {
    return "";
  }
  return format(dt, "dd/MM/yyyy");
};
const eq = (arg1: any, arg2: any) => arg1 == arg2;
