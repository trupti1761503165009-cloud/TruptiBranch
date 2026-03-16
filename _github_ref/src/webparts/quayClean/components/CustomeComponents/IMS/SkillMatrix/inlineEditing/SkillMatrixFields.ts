export class SkillMatrixFields {
    static readonly Id = 'Id';
    static readonly ID = 'ID';
    static readonly Title = 'Title';
    static readonly IMSNos = 'IMSNos';
    static readonly SkillMatrix = 'SkillMatrix';
    static readonly SkillMatrixTitle = 'SkillMatrixTitle';
    static readonly Completed = 'Completed';
    static readonly Trainer = 'Trainer';
    static readonly Cleaner = 'Cleaner';
    static readonly IsTraining = 'IsTraining';
    static readonly SignatureCleaner = 'SignatureCleaner';
    static readonly SignatureTrainer = 'SignatureTrainer';
}

export class ClientViewFields {
    static readonly Id = 'Id';
    static readonly ID = 'ID';
    static readonly Title = 'Title';
    static readonly IMSNos = 'IMSNos';
    static readonly SkillMatrix = 'SkillMatrix';
    static readonly SkillMatrixTitle = 'SkillMatrixTitle';
    static readonly Completed = 'Completed';
    static readonly Trainer = 'Trainer';
    static readonly Cleaner = 'Cleaner';
    static readonly IsTraining = 'IsTraining';
    static readonly SignatureCleaner = 'SignatureCleaner';
    static readonly SignatureTrainer = 'SignatureTrainer';
}

export interface TableData {
    [SkillMatrixFields.Id]: any;
    [SkillMatrixFields.ID]: any;
    [SkillMatrixFields.IMSNos]: any;
    [SkillMatrixFields.SkillMatrix]: any;
    [SkillMatrixFields.SkillMatrixTitle]: any;
    [SkillMatrixFields.Completed]: any;
    [SkillMatrixFields.Trainer]: any;
    [SkillMatrixFields.IsTraining]: any;
    [SkillMatrixFields.Cleaner]?: any;
    [SkillMatrixFields.Title]?: any;
    [SkillMatrixFields.SignatureCleaner]?: any;
    [SkillMatrixFields.SignatureTrainer]?: any;
}

export interface NOData {
    [SkillMatrixFields.Id]: any;
    [SkillMatrixFields.ID]: any;
    [SkillMatrixFields.IMSNos]: any;
    [SkillMatrixFields.SkillMatrix]: any;
    [SkillMatrixFields.SkillMatrixTitle]: any;
    [SkillMatrixFields.Completed]: any;
    [SkillMatrixFields.Trainer]: any;
    [SkillMatrixFields.IsTraining]: any;
    [SkillMatrixFields.Cleaner]?: any;
    [SkillMatrixFields.Title]?: any;
    [SkillMatrixFields.SignatureCleaner]?: any;
    [SkillMatrixFields.SignatureTrainer]?: any;
}
