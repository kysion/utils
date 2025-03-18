# 贡献指南

感谢您对`@kysion/utils`的贡献兴趣！本文档提供了参与项目开发的指南和流程。

## 开发环境设置

1. Fork并克隆仓库:

   ```bash
   git clone https://github.com/kysion/utils.git
   cd utils
   ```

2. 安装依赖:

   ```bash
   pnpm install
   ```

3. 启动开发环境:

   ```bash
   pnpm dev
   ```

## 开发流程

### 分支管理

- `main`: 稳定版本分支
- `dev`: 开发分支
- 功能开发请基于`dev`分支创建feature分支
- 命名规范: `feature/feature-name`或`fix/issue-description`

### 提交规范

我们使用约定式提交(Conventional Commits)规范:

- `feat`: 新功能
- `fix`: 修复Bug
- `docs`: 文档变更
- `style`: 代码风格调整(不影响代码运行)
- `refactor`: 代码重构
- `perf`: 性能优化
- `test`: 添加缺失测试或修正现有测试
- `build`: 构建系统或外部依赖变更
- `ci`: CI配置文件或脚本变更
- `chore`: 其他不修改src或test的变更

示例:

```text
feat: 添加HTTP缓存功能
fix: 修复localStorage在隐私模式下的异常
docs: 更新API文档
```

### 代码风格

项目使用ESLint和Prettier进行代码格式化和规范检查:

```bash
# 检查代码风格
pnpm lint

# 自动修复
pnpm lint:fix
```

### 测试

为每个新功能或修复添加单元测试:

```bash
# 运行所有测试
pnpm test

# 运行特定测试
pnpm test utils/src/__tests__/http
```

测试覆盖率报告:

```bash
pnpm test:coverage
```

## Pull Request流程

1. 确保代码通过所有测试
2. 更新相关文档
3. 提交PR到`dev`分支
4. 在PR描述中提供详细说明:
   - 解决的问题或添加的功能
   - 实现方案
   - 测试覆盖情况
   - 可能的影响范围

## 发布流程

项目维护者会定期将`dev`分支合并到`main`并发布新版本。

版本规范遵循语义化版本(Semantic Versioning):

- MAJOR: 不兼容的API变更
- MINOR: 向后兼容的功能性新增
- PATCH: 向后兼容的问题修正

## 代码审查

代码审查重点关注:

- 功能完整性
- 代码质量
- 测试覆盖
- 文档完整性
- 性能考量
- 兼容性

## 许可证

贡献代码即表示您同意您的贡献将在MIT许可证下发布。
